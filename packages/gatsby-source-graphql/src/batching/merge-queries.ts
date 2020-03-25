import {
  visit,
  visitInParallel,
  Kind,
  DocumentNode,
  VariableNode,
  SelectionNode,
  FragmentSpreadNode,
  FragmentDefinitionNode,
  InlineFragmentNode,
  FieldNode,
  NameNode,
  OperationDefinitionNode,
  Visitor,
  ASTKindToNode,
  VariableDefinitionNode,
  DirectiveNode,
} from "graphql"
import _ from "lodash"

export interface IQuery {
  query: DocumentNode
  variables: object
}

export interface IQueryResult {
  data: object
}

const Prefix = {
  create: (index: number): string => `gatsby${index}_`,
  parseKey: (prefixedKey: string): { index: number; originalKey: string } => {
    const match = /^gatsby([\d]+)_(.*)$/.exec(prefixedKey)
    if (!match || match.length !== 3 || isNaN(Number(match[1])) || !match[2]) {
      throw new Error(`Unexpected data key: ${prefixedKey}`)
    }
    return { index: Number(match[1]), originalKey: match[2] }
  },
}

/**
 * Merge multiple queries into a single query in such a way that query results
 * can be split and transformed as if they were obtained by running original queries.
 *
 * Merging algorithm involves several transformations:
 *  1. Replace top-level fragment spreads with inline fragments (... on Query {})
 *  2. Add unique aliases to all top-level query fields (including those on inline fragments)
 *  3. Prefix all variable definitions and variable usages
 *  4. Prefix names (and spreads) of fragments with variables
 *  5. Dedupe repeating fragments
 *
 * i.e transform:
 *   [
 *     `query Foo($id: ID!) { foo, bar(id: $id), ...FooQuery }
 *     fragment FooQuery on Query { baz }`,
 *
 *    `query Bar($id: ID!) { foo: baz, bar(id: $id), ... on Query { baz } }`
 *   ]
 * to:
 *   query (
 *     $gatsby1_id: ID!
 *     $gatsby2_id: ID!
 *   ) {
 *     gatsby1_foo: foo,
 *     gatsby1_bar: bar(id: $gatsby1_id)
 *     ... on Query @originalFragment(name: "FooQuery") {
 *       gatsby1_baz: baz
 *     }
 *     gatsby2_foo: baz
 *     gatsby2_bar: bar(id: $gatsby2_id)
 *     ... on Query {
 *       gatsby2_baz: baz
 *     }
 *   }
 *   fragment FooQuery on Query { baz }
 */
export function merge(queries: ReadonlyArray<IQuery>): IQuery {
  const mergedVariables: object = {}
  const mergedVariableDefinitions: VariableDefinitionNode[] = []
  const mergedSelections: SelectionNode[] = []
  const mergedFragmentMap: Map<string, FragmentDefinitionNode> = new Map()

  queries.forEach((query: IQuery, index: number) => {
    const prefixedQuery = prefixQueryParts(Prefix.create(index), query)

    prefixedQuery.query.definitions.forEach(def => {
      if (isQueryDefinition(def)) {
        mergedSelections.push(...def.selectionSet.selections)
        mergedVariableDefinitions.push(...(def.variableDefinitions ?? []))
      }
      if (isFragmentDefinition(def)) {
        // Theoretically it is possible to have fragments with the same name but different content
        // in different queries. But Gatsby validation doesn't allow this and we rely on this here
        // One example where this can occur is in gatsby-node or GraphiQL queries
        // (but those are usually not batched)
        mergedFragmentMap.set(def.name.value, def)
      }
    })
    Object.assign(mergedVariables, prefixedQuery.variables)
  })

  const mergedQueryDefinition: OperationDefinitionNode = {
    kind: Kind.OPERATION_DEFINITION,
    operation: `query`,
    variableDefinitions: mergedVariableDefinitions,
    selectionSet: {
      kind: Kind.SELECTION_SET,
      selections: mergedSelections,
    },
  }

  return {
    query: {
      kind: Kind.DOCUMENT,
      definitions: [mergedQueryDefinition, ...mergedFragmentMap.values()],
    },
    variables: mergedVariables,
  }
}

/**
 * Split and transform result of the query produced by the `merge` function
 */
export function resolveResult(mergedQueryResult: IQueryResult): IQueryResult[] {
  const data = mergedQueryResult.data

  return Object.keys(data).reduce(
    (acc: IQueryResult[], prefixedKey: string): IQueryResult[] => {
      const { index, originalKey } = Prefix.parseKey(prefixedKey)
      if (!acc[index]) acc[index] = { data: {} }
      acc[index].data[originalKey] = data[prefixedKey]
      return acc
    },
    []
  )
}

const Visitors = {
  detectFragmentsWithVariables: (
    fragmentsWithVariables: Set<string>
  ): Visitor<ASTKindToNode> => {
    let currentFragmentName
    return {
      [Kind.FRAGMENT_DEFINITION]: {
        enter: (def: FragmentDefinitionNode): void => {
          currentFragmentName = def.name.value
        },
        leave: (): void => {
          currentFragmentName = null
        },
      },
      [Kind.VARIABLE]: (): void => {
        if (currentFragmentName) {
          fragmentsWithVariables.add(currentFragmentName)
        }
      },
    }
  },
  prefixVariables: (prefix: string): Visitor<ASTKindToNode> => {
    return {
      [Kind.VARIABLE]: (variable: VariableNode): VariableNode =>
        prefixNodeName(variable, prefix),
    }
  },
  prefixFragmentNames: (
    prefix: string,
    fragmentNames: Set<string>
  ): Visitor<ASTKindToNode> => {
    return {
      [Kind.FRAGMENT_DEFINITION]: (
        def: FragmentDefinitionNode
      ): FragmentDefinitionNode | void =>
        fragmentNames.has(def.name.value) ? prefixNodeName(def, prefix) : def,

      [Kind.FRAGMENT_SPREAD]: (def: FragmentSpreadNode): FragmentSpreadNode =>
        fragmentNames.has(def.name.value) ? prefixNodeName(def, prefix) : def,
    }
  },
}

function prefixQueryParts(prefix: string, query: IQuery): IQuery {
  let document: DocumentNode = aliasTopLevelFields(prefix, query.query)
  const variableNames = Object.keys(query.variables)

  if (variableNames.length === 0) {
    return { ...query, query: document }
  }

  const fragmentsWithVariables: Set<string> = new Set()

  document = visit(
    document,
    visitInParallel([
      // Note: the sequence is important due to how visitInParallel deals with node edits
      Visitors.detectFragmentsWithVariables(fragmentsWithVariables),
      Visitors.prefixVariables(prefix),
    ])
  )

  if (fragmentsWithVariables.size > 0) {
    // Prefix all fragments and spreads having variables
    // Sadly, have to do another pass as fragment spreads may occur at any level
    // (fragments with variables are relatively rare though)
    document = visit(
      document,
      Visitors.prefixFragmentNames(prefix, fragmentsWithVariables),
      {
        [Kind.DOCUMENT]: [`definitions`],
        [Kind.OPERATION_DEFINITION]: [`selectionSet`],
        [Kind.FRAGMENT_DEFINITION]: [`selectionSet`],
        [Kind.INLINE_FRAGMENT]: [`selectionSet`],
        [Kind.FIELD]: [`selectionSet`],
        [Kind.SELECTION_SET]: [`selections`],
      } as any
    )
  }

  const prefixedVariables = variableNames.reduce((acc, name) => {
    acc[prefix + name] = query.variables[name]
    return acc
  }, {})

  return {
    query: document,
    variables: prefixedVariables,
  }
}

/**
 * Adds prefixed aliases to top-level fields of the query.
 *
 * @see aliasFieldsInSelection for implementation details
 */
function aliasTopLevelFields(prefix: string, doc: DocumentNode): DocumentNode {
  const transformer = {
    [Kind.OPERATION_DEFINITION]: (def): OperationDefinitionNode => {
      const { selections } = def.selectionSet
      return {
        ...def,
        selectionSet: {
          ...def.selectionSet,
          selections: aliasFieldsInSelection(prefix, selections, doc),
        },
      }
    },
  }
  return visit(doc, transformer, { [Kind.DOCUMENT]: [`definitions`] } as any)
}

/**
 * Add aliases to fields of the selection, including top-level fields of inline fragments.
 * Fragment spreads are converted to inline fragments and their top-level fields are also aliased.
 *
 * Note that this method is shallow. It adds aliases only to the top-level fields and doesn't
 * descend to field sub-selections.
 *
 * For example, transforms:
 *   {
 *     foo
 *     ... on Query { foo }
 *     ...FragmentWithBarField
 *   }
 * To:
 *   {
 *     gatsby1_foo: foo
 *     ... on Query { gatsby1_foo: foo }
 *     ... on Query { gatsby1_bar: bar }
 *   }
 */
function aliasFieldsInSelection(
  prefix: string,
  selections: ReadonlyArray<SelectionNode>,
  document: DocumentNode
): SelectionNode[] {
  return _.flatMap(selections, (selection: SelectionNode): SelectionNode[] => {
    switch (selection.kind) {
      case Kind.INLINE_FRAGMENT:
        return [aliasFieldsInInlineFragment(prefix, selection, document)]

      case Kind.FRAGMENT_SPREAD: {
        const inlineFragment = inlineFragmentSpread(selection, document)
        return [
          addSkipDirective(selection),
          aliasFieldsInInlineFragment(prefix, inlineFragment, document),
          // Keep original spread in selection with @skip(if: true)
          // otherwise if this was a single fragment usage the query will fail validation
        ]
      }

      case Kind.FIELD:
      default:
        return [aliasField(selection, prefix)]
    }
  })
}

interface INodeWithDirectives {
  readonly directives?: ReadonlyArray<DirectiveNode>
}

function addSkipDirective<T extends INodeWithDirectives>(node: T): T {
  const skipDirective: DirectiveNode = {
    kind: Kind.DIRECTIVE,
    name: { kind: Kind.NAME, value: `skip` },
    arguments: [
      {
        kind: Kind.ARGUMENT,
        name: { kind: Kind.NAME, value: `if` },
        value: { kind: Kind.BOOLEAN, value: true },
      },
    ],
  }
  return {
    ...node,
    directives: [skipDirective],
  }
}

/**
 * Add aliases to top-level fields of the inline fragment.
 * Returns new inline fragment node.
 *
 * For Example, transforms:
 *   ... on Query { foo, ... on Query { bar: foo } }
 * To
 *   ... on Query { gatsby1_foo: foo, ... on Query { gatsby1_bar: foo } }
 */
function aliasFieldsInInlineFragment(
  prefix: string,
  fragment: InlineFragmentNode,
  document: DocumentNode
): InlineFragmentNode {
  const { selections } = fragment.selectionSet
  return {
    ...fragment,
    selectionSet: {
      ...fragment.selectionSet,
      selections: aliasFieldsInSelection(prefix, selections, document),
    },
  }
}

/**
 * Replaces fragment spread with inline fragment
 *
 * Example:
 *   query { ...Spread }
 *   fragment Spread on Query { bar }
 *
 * Transforms to:
 *   query { ... on Query { bar } }
 */
function inlineFragmentSpread(
  spread: FragmentSpreadNode,
  document: DocumentNode
): InlineFragmentNode {
  const fragment = document.definitions.find(
    def =>
      def.kind === Kind.FRAGMENT_DEFINITION &&
      def.name.value === spread.name.value
  )
  if (!fragment) {
    throw new Error(`Fragment ${spread.name.value} does not exist`)
  }
  const { typeCondition, selectionSet } = fragment as FragmentDefinitionNode

  return {
    kind: Kind.INLINE_FRAGMENT,
    typeCondition,
    selectionSet,
    directives: spread.directives,
  }
}

function prefixNodeName<T extends { name: NameNode }>(
  namedNode: T,
  prefix: string
): T {
  return {
    ...namedNode,
    name: {
      ...namedNode.name,
      value: prefix + namedNode.name.value,
    },
  }
}

/**
 * Returns a new FieldNode with prefixed alias
 *
 * Example. Given prefix === "gatsby1_" transforms:
 *   { foo } -> { gatsby1_foo: foo }
 *   { foo: bar } -> { gatsby1_foo: bar }
 */
function aliasField(field: FieldNode, aliasPrefix: string): FieldNode {
  const aliasNode = field.alias ? field.alias : field.name
  return {
    ...field,
    alias: {
      ...aliasNode,
      value: aliasPrefix + aliasNode.value,
    },
  }
}

function isQueryDefinition(def): def is OperationDefinitionNode {
  return def.kind === Kind.OPERATION_DEFINITION && def.operation === `query`
}

function isFragmentDefinition(def): def is FragmentDefinitionNode {
  return def.kind === Kind.FRAGMENT_DEFINITION
}
