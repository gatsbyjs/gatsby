import systemPath from "path"
import normalize from "normalize-path"
import _ from "lodash"
import {
  GraphQLList,
  GraphQLType,
  getNullableType,
  getNamedType,
  Kind,
  GraphQLFieldConfig,
  GraphQLResolveInfo,
  isObjectType,
  isInterfaceType,
  isEnumType,
  SelectionSetNode,
  SelectionNode,
  FieldNode,
} from "graphql"
import { getValueAt } from "../utils/get-value-at"
import {
  GatsbyResolver,
  IGatsbyConnection,
  IGatsbyResolverContext,
} from "./type-definitions"

export function findMany<TSource, TArgs>(
  typeName: string
): GatsbyResolver<TSource, TArgs> {
  return function findManyResolver(_source, args, context, info): any {
    if (context.stats) {
      context.stats.totalRunQuery++
      context.stats.totalPluralRunQuery++
    }

    return context.nodeModel.runQuery(
      {
        query: args,
        firstOnly: false,
        type: info.schema.getType(typeName),
        stats: context.stats,
        tracer: context.tracer,
      },
      { path: context.path, connectionType: typeName }
    )
  }
}

export function findOne<TSource, TArgs>(
  typeName: string
): GatsbyResolver<TSource, TArgs> {
  return function findOneResolver(_source, args, context, info): any {
    if (context.stats) {
      context.stats.totalRunQuery++
    }
    return context.nodeModel.runQuery(
      {
        query: { filter: args },
        firstOnly: true,
        type: info.schema.getType(typeName),
        stats: context.stats,
        tracer: context.tracer,
      },
      { path: context.path }
    )
  }
}

type PaginatedArgs<TArgs> = TArgs & { skip?: number; limit?: number }

export function findManyPaginated<TSource, TArgs, TNodeType>(
  typeName: string
): GatsbyResolver<TSource, PaginatedArgs<TArgs>> {
  return async function findManyPaginatedResolver(
    source,
    args,
    context,
    info
  ): Promise<IGatsbyConnection<TNodeType>> {
    // Peek into selection set and pass on the `field` arg of `group` and
    // `distinct` which might need to be resolved.
    const group = getProjectedField(info, `group`)
    const distinct = getProjectedField(info, `distinct`)
    const extendedArgs = {
      ...args,
      group: group || [],
      distinct: distinct || [],
    }

    const result = await findMany<TSource, PaginatedArgs<TArgs>>(typeName)(
      source,
      extendedArgs,
      context,
      info
    )
    return paginate(result, { skip: args.skip, limit: args.limit })
  }
}

interface IFieldConnectionArgs {
  field: string
}

export const distinct: GatsbyResolver<
  IGatsbyConnection<any>,
  IFieldConnectionArgs
> = function distinctResolver(source, args): Array<string> {
  const { field } = args
  const { edges } = source
  const values = edges.reduce((acc, { node }) => {
    const value =
      getValueAt(node, `__gatsby_resolved.${field}`) || getValueAt(node, field)
    return value != null
      ? acc.concat(value instanceof Date ? value.toISOString() : value)
      : acc
  }, [])
  return Array.from(new Set(values)).sort()
}

type IGatsbyGroupReturnValue<NodeType> = Array<
  IGatsbyConnection<NodeType> & {
    field: string
    fieldValue: string | undefined
  }
>

export const group: GatsbyResolver<
  IGatsbyConnection<any>,
  PaginatedArgs<IFieldConnectionArgs>
> = function groupResolver(source, args): IGatsbyGroupReturnValue<any> {
  const { field } = args
  const { edges } = source
  const groupedResults: Record<string, Array<string>> = edges.reduce(
    (acc, { node }) => {
      const value =
        getValueAt(node, `__gatsby_resolved.${field}`) ||
        getValueAt(node, field)
      const values = Array.isArray(value) ? value : [value]
      values
        .filter(value => value != null)
        .forEach(value => {
          const key = value instanceof Date ? value.toISOString() : value
          acc[key] = (acc[key] || []).concat(node)
        })
      return acc
      // Note: using Object.create on purpose:
      //   object key may be arbitrary string including reserved words (i.e. `constructor`)
      //   see: https://github.com/gatsbyjs/gatsby/issues/22508
    },
    Object.create(null)
  )

  return Object.keys(groupedResults)
    .sort()
    .reduce((acc: IGatsbyGroupReturnValue<any>, fieldValue: string) => {
      acc.push({
        ...paginate(groupedResults[fieldValue], args),
        field,
        fieldValue,
      })
      return acc
    }, [])
}

export function paginate<NodeType>(
  results: Array<NodeType> = [],
  { skip = 0, limit }: { skip?: number; limit?: number }
): IGatsbyConnection<NodeType> {
  if (results === null) {
    results = []
  }

  const count = results.length
  const items = results.slice(skip, limit && skip + limit)

  const pageCount = limit
    ? Math.ceil(skip / limit) + Math.ceil((count - skip) / limit)
    : skip
    ? 2
    : 1
  const currentPage = limit ? Math.ceil(skip / limit) + 1 : skip ? 2 : 1
  const hasPreviousPage = currentPage > 1
  const hasNextPage = skip + (limit || NaN) < count

  return {
    totalCount: count,
    edges: items.map((item, i, arr) => {
      return {
        node: item,
        next: arr[i + 1],
        previous: arr[i - 1],
      }
    }),
    nodes: items,
    pageInfo: {
      currentPage,
      hasPreviousPage,
      hasNextPage,
      itemCount: items.length,
      pageCount,
      perPage: limit,
    },
  }
}

export function link<TSource, TArgs>(
  options: {
    by: string
    type?: GraphQLType
    from?: string
    fromNode?: string
  } = {
    by: `id`,
  },
  fieldConfig: GraphQLFieldConfig<
    TSource,
    IGatsbyResolverContext<TSource, TArgs>,
    TArgs
  >
): GatsbyResolver<TSource, TArgs> {
  return async function linkResolver(
    source,
    args,
    context,
    info
  ): Promise<any> {
    const resolver = fieldConfig.resolve || context.defaultFieldResolver
    const fieldValue = await resolver(source, args, context, {
      ...info,
      from: options.from || info.from,
      fromNode: options.from ? options.fromNode : info.fromNode,
    })

    if (fieldValue == null) return null

    const returnType = getNullableType(options.type || info.returnType)
    const type = getNamedType(returnType)

    if (options.by === `id`) {
      if (Array.isArray(fieldValue)) {
        return context.nodeModel.getNodesByIds(
          { ids: fieldValue, type: type },
          { path: context.path }
        )
      } else {
        return context.nodeModel.getNodeById(
          { id: fieldValue, type: type },
          { path: context.path }
        )
      }
    }

    const equals = (value: string): any => {
      return { eq: value }
    }
    const oneOf = (value: string): any => {
      return { in: value }
    }

    // Return early if fieldValue is [] since { in: [] } doesn't make sense
    if (Array.isArray(fieldValue) && fieldValue.length === 0) {
      return fieldValue
    }

    const operator = Array.isArray(fieldValue) ? oneOf : equals
    const runQueryArgs = args as TArgs & { filter: any }
    runQueryArgs.filter = options.by
      .split(`.`)
      .reduceRight((acc, key, i, { length }) => {
        return {
          [key]: i === length - 1 ? operator(acc) : acc,
        }
      }, fieldValue)

    const firstOnly = !(returnType instanceof GraphQLList)

    if (context.stats) {
      context.stats.totalRunQuery++
      if (firstOnly) {
        context.stats.totalPluralRunQuery++
      }
    }

    const result = await context.nodeModel.runQuery(
      {
        query: runQueryArgs,
        firstOnly,
        type,
        stats: context.stats,
        tracer: context.tracer,
      },
      { path: context.path }
    )
    if (
      returnType instanceof GraphQLList &&
      Array.isArray(fieldValue) &&
      Array.isArray(result)
    ) {
      return fieldValue.map(value =>
        result.find(obj => getValueAt(obj, options.by) === value)
      )
    } else {
      return result
    }
  }
}

export function fileByPath<TSource, TArgs>(
  options: {
    from?: string
    fromNode?: string
  } = {},
  fieldConfig
): GatsbyResolver<TSource, TArgs> {
  return async function fileByPathResolver(
    source,
    args,
    context,
    info
  ): Promise<any> {
    const resolver = fieldConfig.resolve || context.defaultFieldResolver
    const fieldValue = await resolver(source, args, context, {
      ...info,
      from: options.from || info.from,
      fromNode: options.from ? options.fromNode : info.fromNode,
    })

    if (fieldValue == null) return null

    // Find the File node for this node (we assume the node is something
    // like markdown which would be a child node of a File node).
    const parentFileNode = context.nodeModel.findRootNodeAncestor(
      source,
      node => node.internal && node.internal.type === `File`
    )

    const findLinkedFileNode = (relativePath: string): any => {
      // Use the parent File node to create the absolute path to
      // the linked file.
      const fileLinkPath = normalize(
        systemPath.resolve(parentFileNode.dir, relativePath)
      )

      // Use that path to find the linked File node.
      const linkedFileNode = _.find(
        context.nodeModel.getAllNodes({ type: `File` }),
        n => n.absolutePath === fileLinkPath
      )
      return linkedFileNode
    }

    return resolveValue(findLinkedFileNode, fieldValue)
  }
}

function resolveValue(
  resolve: (a: any) => any,
  value: any | Array<any>
): any | Array<any> {
  return Array.isArray(value)
    ? value.map(v => resolveValue(resolve, v))
    : resolve(value)
}

function getProjectedField(
  info: GraphQLResolveInfo,
  fieldName: string
): Array<string> {
  const selectionSet = info.fieldNodes[0].selectionSet
  if (selectionSet) {
    const fieldNodes = getFieldNodeByNameInSelectionSet(
      selectionSet,
      fieldName,
      info
    )

    const returnType = getNullableType(info.returnType)

    if (isObjectType(returnType) || isInterfaceType(returnType)) {
      const field = returnType.getFields()[fieldName]
      const fieldArg = field?.args?.find(arg => arg.name === `field`)
      if (fieldArg) {
        const fieldEnum = getNullableType(fieldArg.type)

        if (isEnumType(fieldEnum)) {
          return fieldNodes.reduce(
            (acc: Array<string>, fieldNode: FieldNode) => {
              const fieldArg = fieldNode.arguments?.find(
                arg => arg.name.value === `field`
              )
              if (fieldArg?.value.kind === Kind.ENUM) {
                const enumKey = fieldArg.value.value
                const enumValue = fieldEnum.getValue(enumKey)
                if (enumValue) {
                  return [...acc, enumValue.value]
                }
              }
              return acc
            },
            []
          )
        }
      }
    }
  }

  return []
}

function getFieldNodeByNameInSelectionSet(
  selectionSet: SelectionSetNode,
  fieldName: string,
  info: GraphQLResolveInfo
): Array<FieldNode> {
  return selectionSet.selections.reduce(
    (acc: Array<FieldNode>, selection: SelectionNode) => {
      if (selection.kind === Kind.FRAGMENT_SPREAD) {
        const fragmentDef = info.fragments[selection.name.value]
        if (fragmentDef) {
          return [
            ...acc,
            ...getFieldNodeByNameInSelectionSet(
              fragmentDef.selectionSet,
              fieldName,
              info
            ),
          ]
        }
      } else if (selection.kind === Kind.INLINE_FRAGMENT) {
        return [
          ...acc,
          ...getFieldNodeByNameInSelectionSet(
            selection.selectionSet,
            fieldName,
            info
          ),
        ]
      } /* FIELD_NODE */ else {
        if (selection.name.value === fieldName) {
          return [...acc, selection]
        }
      }
      return acc
    },
    []
  )
}

export const defaultFieldResolver: GatsbyResolver<
  any,
  any
> = function defaultFieldResolver(source, args, context, info) {
  if (
    (typeof source == `object` && source !== null) ||
    typeof source === `function`
  ) {
    if (info.from) {
      if (info.fromNode) {
        const node = context.nodeModel.findRootNodeAncestor(source)
        if (!node) return null
        return getValueAt(node, info.from)
      }
      return getValueAt(source, info.from)
    }
    const property = source[info.fieldName]
    if (typeof property === `function`) {
      return source[info.fieldName](args, context, info)
    }
    return property
  }

  return null
}

export function tracingResolver<TSource, TArgs>(
  resolver: GatsbyResolver<TSource, TArgs>
): GatsbyResolver<TSource, TArgs> {
  return async function wrappedTracingResolver(
    parent,
    args,
    context,
    info
  ): Promise<any> {
    let activity
    if (context.tracer) {
      activity = context.tracer.createResolverActivity(
        info.path,
        `${info.parentType.name}.${info.fieldName}`
      )
      activity.start()
    }
    try {
      return resolver(parent, args, context, info)
    } finally {
      if (activity) {
        activity.end()
      }
    }
  }
}

export const defaultTracingResolver = tracingResolver(defaultFieldResolver)
