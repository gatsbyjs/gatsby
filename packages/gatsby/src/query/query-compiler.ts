// @flow

/** Query compiler extracts queries and fragments from all files, validates them
 * and then collocates them with fragments they require. This way fragments
 * have global scope and can be used in any other query or fragment.
 */

import _ from "lodash"
import path from "path"
import normalize from "normalize-path"
import glob from "glob"

import {
  validate,
  print,
  visit,
  visitWithTypeInfo,
  TypeInfo,
  isAbstractType,
  Kind,
  FragmentsOnCompositeTypesRule,
  LoneAnonymousOperationRule,
  PossibleFragmentSpreadsRule,
  ScalarLeafsRule,
  ValuesOfCorrectTypeRule,
  VariablesAreInputTypesRule,
  VariablesInAllowedPositionRule,
  DocumentNode,
  GraphQLSchema,
  ValidationRule,
  DefinitionNode,
  FragmentSpreadNode,
} from "graphql"

import { getGatsbyDependents } from "../utils/gatsby-dependents"
import { store } from "../redux"
import { IGatsbyState } from "../redux/types"
import * as actions from "../redux/actions/internal"
import { boundActionCreators } from "../redux/actions"

import { websocketManager } from "../utils/websocket-manager"
import FileParser from "./file-parser"
import {
  graphqlError,
  multipleRootQueriesError,
  duplicateFragmentError,
  unknownFragmentError,
} from "./graphql-errors"
import report from "gatsby-cli/lib/reporter"
import errorParser, {
  locInGraphQlToLocInFile,
  ILocOfGraphQLDocInSrcFile,
} from "./error-parser"
import { GraphQLDocumentInFile } from "./file-parser"
import { Span } from "opentracing"
import { IQuery } from "./query-watcher"

const overlayErrorID = `graphql-compiler`

interface IDefinitionByName {
  name: string
  def: DefinitionNode
  filePath: string
  text: string
  templateLoc: ILocOfGraphQLDocInSrcFile
  printedAst: null | string
  isHook: boolean
  isStaticQuery: boolean
  isFragment: boolean
  hash: string
}

export default async function compile({
  parentSpan,
}: { parentSpan?: Span } = {}): Promise<Map<string, IQuery>> {
  // TODO: swap plugins to themes
  const {
    program,
    schema,
    themes,
    flattenedPlugins,
  }: IGatsbyState = store.getState()

  const activity = report.activityTimer(`extract queries from components`, {
    parentSpan,
    id: `query-extraction`,
  })
  activity.start()

  const errors = []
  const addError = errors.push.bind(errors)

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const parsedQueries = await parseQueries({
    base: program.directory,
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    additional: resolveThemes(
      themes.themes
        ? themes.themes
        : flattenedPlugins.map(plugin => {
            return {
              themeDir: plugin.pluginFilepath,
            }
          })
    ),
    addError,
    parentSpan,
  })

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const queries = processQueries({
    schema,
    parsedQueries,
    addError,
    parentSpan,
  })

  if (errors.length !== 0) {
    const structuredErrors = activity.panicOnBuild(errors)
    if (process.env.gatsby_executing_command === `develop`) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      websocketManager.emitError(overlayErrorID, structuredErrors)
    }
  } else {
    if (process.env.gatsby_executing_command === `develop`) {
      // emitError with `null` as 2nd param to clear browser error overlay
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      websocketManager.emitError(overlayErrorID, null)
    }
  }
  activity.end()

  return queries
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const resolveThemes = (themes: any = []): any =>
  themes.reduce((merged, theme) => {
    merged.push(theme.themeDir)
    return merged
  }, [])

export const parseQueries = async ({
  base,
  additional,
  addError,
  parentSpan,
}: {
  base: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  additional: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addError: any
  parentSpan?: Span
}): Promise<GraphQLDocumentInFile> => {
  const filesRegex = `*.+(t|j)s?(x)`
  // Pattern that will be appended to searched directories.
  // It will match any .js, .jsx, .ts, and .tsx files, that are not
  // inside <searched_directory>/node_modules.
  const pathRegex = `/{${filesRegex},!(node_modules)/**/${filesRegex}}`

  const modulesThatUseGatsby = await getGatsbyDependents()

  let files = [
    path.join(base, `src`),
    path.join(base, `.cache`, `fragments`),
    ...additional.map(additional => path.join(additional, `src`)),
    ...modulesThatUseGatsby.map(module => module.path),
  ].reduce((merged, folderPath) => {
    merged.push(
      ...glob.sync(path.join(folderPath, pathRegex), {
        nodir: true,
      })
    )
    return merged
  }, [])

  files = files.filter(d => !d.match(/\.d\.ts$/))

  files = files.map(normalize)

  // We should be able to remove the following and preliminary tests do suggest
  // that they aren't needed anymore since we transpile node_modules now
  // However, there could be some cases (where a page is outside of src for example)
  // that warrant keeping this and removing later once we have more confidence (and tests)

  // Ensure all page components added as they're not necessarily in the
  // pages directory e.g. a plugin could add a page component. Plugins
  // *should* copy their components (if they add a query) to .cache so that
  // our babel plugin to remove the query on building is active.
  // Otherwise the component will throw an error in the browser of
  // "graphql is not defined".
  files = files.concat(
    Array.from(store.getState().components.keys(), c => normalize(c))
  )

  files = _.uniq(files)

  const parser = new FileParser({ parentSpan: parentSpan })

  return await parser.parseFiles(files, addError)
}

export const processQueries = ({
  schema,
  parsedQueries,
  addError,
  parentSpan,
}: {
  schema: GraphQLSchema
  parsedQueries: Array<GraphQLDocumentInFile>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addError: any
  parentSpan?: Span
}): Map<string, IQuery> => {
  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  const { definitionsByName, operations } = extractOperations(
    schema,
    parsedQueries,
    addError
  )

  boundActionCreators.setGraphQLDefinitions(definitionsByName)

  // eslint-disable-next-line @typescript-eslint/no-use-before-define
  return processDefinitions({
    schema,
    operations,
    definitionsByName,
    addError,
    parentSpan,
  })
}

const preValidationRules: ReadonlyArray<ValidationRule> = [
  LoneAnonymousOperationRule,
  FragmentsOnCompositeTypesRule,
  VariablesAreInputTypesRule,
  ScalarLeafsRule,
  PossibleFragmentSpreadsRule,
  ValuesOfCorrectTypeRule,
  VariablesInAllowedPositionRule,
]

// done
const extractOperations = (
  schema: GraphQLSchema,
  parsedQueries: Array<GraphQLDocumentInFile>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addError: any
): {
  definitionsByName: Map<string, IDefinitionByName>
  operations: Array<DefinitionNode>
} => {
  const definitionsByName = new Map<string, IDefinitionByName>()
  const operations: Array<DefinitionNode> = []

  for (const {
    filePath,
    text,
    templateLoc,
    hash,
    doc,
    isHook,
    isStaticQuery,
  } of parsedQueries) {
    const errors = validate(schema, doc, preValidationRules)

    if (errors && errors.length) {
      addError(
        ...errors.map(error => {
          const location = {
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            start: locInGraphQlToLocInFile(templateLoc, error.locations[0]),
          }
          return errorParser({ message: error.message, filePath, location })
        })
      )

      store.dispatch(
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        actions.queryExtractionGraphQLError({
          componentPath: filePath,
        })
      )
      // Something is super wrong with this document, so we report it and skip
      continue
    }

    doc.definitions.forEach((def: DefinitionNode) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
      // @ts-ignore
      const name = def.name.value
      let printedAst: null | string = null
      if (def.kind === Kind.OPERATION_DEFINITION) {
        operations.push(def)
      } else if (def.kind === Kind.FRAGMENT_DEFINITION) {
        // Check if we already registered a fragment with this name
        printedAst = print(def)
        if (definitionsByName.has(name)) {
          const otherDef = definitionsByName.get(name)
          // If it's not an accidental duplicate fragment, but is a different
          // one - we report an error
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          if (printedAst !== otherDef.printedAst) {
            addError(
              duplicateFragmentError({
                name,
                leftDefinition: {
                  def,
                  filePath,
                  text,
                  templateLoc,
                },
                rightDefinition: otherDef,
              })
            )
            // We won't know which one to use, so it's better to fail both of
            // them.
            definitionsByName.delete(name)
          }
          return
        }
      }

      definitionsByName.set(name, {
        name,
        def,
        filePath,
        text: text,
        templateLoc,
        printedAst,
        isHook,
        isStaticQuery,
        isFragment: def.kind === Kind.FRAGMENT_DEFINITION,
        hash: hash,
      })
    })
  }

  return {
    definitionsByName,
    operations,
  }
}

const processDefinitions = ({
  schema,
  operations,
  definitionsByName,
  addError,
}: {
  schema: GraphQLSchema
  operations: Array<DefinitionNode>
  definitionsByName: Map<string, IDefinitionByName>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addError: any
  parentSpan?: Span
}): Map<string, IQuery> => {
  const processedQueries = new Map<string, IQuery>()

  const fragmentsUsedByFragment = new Map<string, Set<string>>()

  const fragmentNames = Array.from(definitionsByName.entries())
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .filter(([_, def]) => def.isFragment)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([name, _]) => name)

  for (const operation of operations) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const name = operation.name.value
    const originalDefinition = definitionsByName.get(name) as IDefinitionByName
    // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
    // @ts-ignore
    const filePath = definitionsByName.get(name).filePath
    if (processedQueries.has(filePath)) {
      const otherQuery = processedQueries.get(filePath)

      addError(
        multipleRootQueriesError(
          filePath,
          originalDefinition.def,
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          otherQuery && definitionsByName.get(otherQuery.name).def
        )
      )

      store.dispatch(
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        actions.queryExtractionGraphQLError({
          componentPath: filePath,
        })
      )
      continue
    }

    const {
      usedFragments,
      missingFragments,
      // eslint-disable-next-line @typescript-eslint/no-use-before-define
    } = determineUsedFragmentsForDefinition(
      originalDefinition,
      definitionsByName,
      fragmentsUsedByFragment
    )

    if (missingFragments.length > 0) {
      for (const { filePath, definition, node } of missingFragments) {
        store.dispatch(
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          actions.queryExtractionGraphQLError({
            componentPath: filePath,
          })
        )
        addError(
          unknownFragmentError({
            fragmentNames,
            filePath,
            definition,
            node,
          })
        )
      }
      continue
    }

    let document = {
      kind: Kind.DOCUMENT,
      definitions: Array.from(usedFragments.values())
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        .map(name => definitionsByName.get(name).def)
        .concat([operation]),
    }

    const errors = validate(schema, document)
    if (errors && errors.length) {
      for (const error of errors) {
        const { formattedMessage, message } = graphqlError(
          definitionsByName,
          error
        )

        const filePath = originalDefinition.filePath
        store.dispatch(
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          actions.queryExtractionGraphQLError({
            componentPath: filePath,
            error: formattedMessage,
          })
        )
        const location = locInGraphQlToLocInFile(
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          originalDefinition.templateLoc,
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          error.locations[0]
        )
        addError(
          errorParser({
            location: {
              start: location,
              end: location,
            },
            message,
            filePath,
          })
        )
      }
      continue
    }

    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    document = addExtraFields(document, schema)

    const query = {
      name,
      text: print(document),
      originalText: originalDefinition.text,
      path: filePath,
      isHook: originalDefinition.isHook,
      isStaticQuery: originalDefinition.isStaticQuery,
      hash: originalDefinition.hash,
      ...(originalDefinition.isStaticQuery && {
        id:
          `sq--` +
          _.kebabCase(
            `${path.relative(store.getState().program.directory, filePath)}`
          ),
      }),
    }

    if (
      query.isHook &&
      process.env.NODE_ENV === `production` &&
      typeof require(`react`).useContext !== `function`
    ) {
      report.panicOnBuild(
        `You're likely using a version of React that doesn't support Hooks\n` +
          `Please update React and ReactDOM to 16.8.0 or later to use the useStaticQuery hook.`
      )
    }

    processedQueries.set(filePath, query as IQuery)
  }

  return processedQueries
}

const determineUsedFragmentsForDefinition = (
  definition: IDefinitionByName,
  definitionsByName: Map<string, IDefinitionByName>,
  fragmentsUsedByFragment: Map<string, Set<string>>,
  traversalPath: Array<string> = []
): {
  usedFragments: Set<string>
  missingFragments: Array<{
    filePath: string
    definition: IDefinitionByName
    node: FragmentSpreadNode
  }>
} => {
  const { def, name, isFragment, filePath } = definition
  const cachedUsedFragments = fragmentsUsedByFragment.get(name)
  if (cachedUsedFragments) {
    return { usedFragments: cachedUsedFragments, missingFragments: [] }
  } else {
    const usedFragments = new Set<string>()
    const missingFragments: Array<{
      filePath: string
      definition: IDefinitionByName
      node: FragmentSpreadNode
    }> = []
    visit(def, {
      [Kind.FRAGMENT_SPREAD]: (node: FragmentSpreadNode) => {
        const name = node.name.value
        const fragmentDefinition = definitionsByName.get(name)
        if (fragmentDefinition) {
          if (traversalPath.includes(name)) {
            // Already visited this fragment during current traversal.
            //   Visiting it again will cause a stack overflow
            return
          }
          traversalPath.push(name)
          usedFragments.add(name)
          const {
            usedFragments: usedFragmentsForFragment,
            missingFragments: missingFragmentsForFragment,
          } = determineUsedFragmentsForDefinition(
            fragmentDefinition,
            definitionsByName,
            fragmentsUsedByFragment,
            traversalPath
          )
          traversalPath.pop()
          usedFragmentsForFragment.forEach(fragmentName =>
            usedFragments.add(fragmentName)
          )
          missingFragments.push(...missingFragmentsForFragment)
        } else {
          missingFragments.push({
            filePath,
            definition,
            node,
          })
        }
      },
    })
    if (isFragment) {
      fragmentsUsedByFragment.set(name, usedFragments)
    }
    return { usedFragments, missingFragments }
  }
}

/**
 * Automatically add:
 *   `__typename` field to abstract types (unions, interfaces)
 *   `id` field to all object/interface types having an id
 * TODO: Remove this in v3.0 as it is a legacy from Relay compiler
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const addExtraFields = (document: DocumentNode, schema: GraphQLSchema): any => {
  const typeInfo = new TypeInfo(schema)
  const contextStack = []

  const transformer = visitWithTypeInfo(typeInfo, {
    enter: {
      [Kind.SELECTION_SET]: (): void => {
        // Entering selection set:
        //   selection sets can be nested, so keeping their metadata stacked
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        contextStack.push({ hasTypename: false })
      },
      [Kind.FIELD]: (node): void => {
        // Entering a field of the current selection-set:
        //   mark which fields already exist in this selection set to avoid duplicates
        const context = contextStack[contextStack.length - 1]
        if (
          node.name.value === `__typename` ||
          node?.alias?.value === `__typename`
        ) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
          // @ts-ignore
          context.hasTypename = true
        }
      },
    },
    leave: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [Kind.SELECTION_SET]: (node): any => {
        // Modify the selection-set AST on leave (add extra fields unless they already exist)
        const context = contextStack.pop()
        const parentType = typeInfo.getParentType()
        const extraFields = []

        // Adding __typename to unions and interfaces (if required)
        // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
        // @ts-ignore
        if (!context.hasTypename && isAbstractType(parentType)) {
          extraFields.push({
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            kind: Kind.FIELD,
            // eslint-disable-next-line @typescript-eslint/ban-ts-ignore
            // @ts-ignore
            name: { kind: Kind.NAME, value: `__typename` },
          })
        }
        return extraFields.length > 0
          ? { ...node, selections: [...extraFields, ...node.selections] }
          : undefined
      },
    },
  })

  return visit(document, transformer)
}
