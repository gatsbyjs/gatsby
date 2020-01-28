// @flow

/** Query compiler extracts queries and fragments from all files, validates them
 * and then collocates them with fragments they require. This way fragments
 * have global scope and can be used in any other query or fragment.
 */

const _ = require(`lodash`)

const path = require(`path`)
const normalize = require(`normalize-path`)
const glob = require(`glob`)

const {
  validate,
  print,
  visit,
  visitWithTypeInfo,
  TypeInfo,
  isAbstractType,
  isObjectType,
  isInterfaceType,
  Kind,
  FragmentsOnCompositeTypesRule,
  KnownTypeNamesRule,
  LoneAnonymousOperationRule,
  PossibleFragmentSpreadsRule,
  ScalarLeafsRule,
  ValuesOfCorrectTypeRule,
  VariablesAreInputTypesRule,
  VariablesInAllowedPositionRule,
} = require(`graphql`)

const getGatsbyDependents = require(`../utils/gatsby-dependents`)
const { store } = require(`../redux`)
import * as actions from "../redux/actions/internal"
const { default: FileParser } = require(`./file-parser`)
const {
  graphqlError,
  multipleRootQueriesError,
  duplicateFragmentError,
  unknownFragmentError,
} = require(`./graphql-errors`)
const report = require(`gatsby-cli/lib/reporter`)
const {
  default: errorParser,
  locInGraphQlToLocInFile,
} = require(`./error-parser`)
const websocketManager = require(`../utils/websocket-manager`)

const overlayErrorID = `graphql-compiler`

export default async function compile({ parentSpan } = {}): Promise<
  Map<string, RootQuery>
> {
  // TODO: swap plugins to themes
  const { program, schema, themes, flattenedPlugins } = store.getState()

  const activity = report.activityTimer(`extract queries from components`, {
    parentSpan,
    id: `query-extraction`,
  })
  activity.start()

  const errors = []
  const addError = errors.push.bind(errors)

  const parsedQueries = await parseQueries({
    base: program.directory,
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

  const queries = processQueries({
    schema,
    parsedQueries,
    addError,
    parentSpan,
  })

  if (errors.length !== 0) {
    const structuredErrors = activity.panicOnBuild(errors)
    if (process.env.gatsby_executing_command === `develop`) {
      websocketManager.emitError(overlayErrorID, structuredErrors)
    }
  } else {
    if (process.env.gatsby_executing_command === `develop`) {
      // emitError with `null` as 2nd param to clear browser error overlay
      websocketManager.emitError(overlayErrorID, null)
    }
  }
  activity.end()

  return queries
}

export const resolveThemes = (themes = []) =>
  themes.reduce((merged, theme) => {
    merged.push(theme.themeDir)
    return merged
  }, [])

export const parseQueries = async ({
  base,
  additional,
  addError,
  parentSpan,
}) => {
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
}) => {
  const { definitionsByName, operations } = extractOperations(
    schema,
    parsedQueries,
    addError,
    parentSpan
  )

  return processDefinitions({
    schema,
    operations,
    definitionsByName,
    addError,
    parentSpan,
  })
}

const preValidationRules = [
  LoneAnonymousOperationRule,
  KnownTypeNamesRule,
  FragmentsOnCompositeTypesRule,
  VariablesAreInputTypesRule,
  ScalarLeafsRule,
  PossibleFragmentSpreadsRule,
  ValuesOfCorrectTypeRule,
  VariablesInAllowedPositionRule,
]

const extractOperations = (schema, parsedQueries, addError, parentSpan) => {
  const definitionsByName = new Map()
  const operations = []

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
            start: locInGraphQlToLocInFile(templateLoc, error.locations[0]),
          }
          return errorParser({ message: error.message, filePath, location })
        })
      )

      store.dispatch(
        actions.queryExtractionGraphQLError({
          componentPath: filePath,
        })
      )
      // Something is super wrong with this document, so we report it and skip
      continue
    }

    doc.definitions.forEach((def: any) => {
      const name = def.name.value
      let printedAst = null
      if (def.kind === Kind.OPERATION_DEFINITION) {
        operations.push(def)
      } else if (def.kind === Kind.FRAGMENT_DEFINITION) {
        // Check if we already registered a fragment with this name
        printedAst = print(def)
        if (definitionsByName.has(name)) {
          const otherDef = definitionsByName.get(name)
          // If it's not an accidental duplicate fragment, but is a different
          // one - we report an error
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
  parentSpan,
}) => {
  const processedQueries: Queries = new Map()

  const fragmentsUsedByFragment = new Map()

  const fragmentNames = Array.from(definitionsByName.entries())
    .filter(([_, def]) => def.isFragment)
    .map(([name, _]) => name)

  for (const operation of operations) {
    const name = operation.name.value
    const originalDefinition = definitionsByName.get(name)
    const filePath = definitionsByName.get(name).filePath
    if (processedQueries.has(filePath)) {
      const otherQuery = processedQueries.get(filePath)

      addError(
        multipleRootQueriesError(
          filePath,
          originalDefinition.def,
          otherQuery && definitionsByName.get(otherQuery.name).def
        )
      )

      store.dispatch(
        actions.queryExtractionGraphQLError({
          componentPath: filePath,
        })
      )
      continue
    }

    const {
      usedFragments,
      missingFragments,
    } = determineUsedFragmentsForDefinition(
      originalDefinition,
      definitionsByName,
      fragmentsUsedByFragment
    )

    if (missingFragments.length > 0) {
      for (const { filePath, definition, node } of missingFragments) {
        store.dispatch(
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
          actions.queryExtractionGraphQLError({
            componentPath: filePath,
            error: formattedMessage,
          })
        )
        const location = locInGraphQlToLocInFile(
          originalDefinition.templateLoc,
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

    document = addExtraFields(document, schema)

    const query = {
      name,
      text: print(document),
      originalText: originalDefinition.text,
      path: filePath,
      isHook: originalDefinition.isHook,
      isStaticQuery: originalDefinition.isStaticQuery,
      hash: originalDefinition.hash,
    }

    if (query.isStaticQuery) {
      query.id =
        `sq--` +
        _.kebabCase(
          `${path.relative(store.getState().program.directory, filePath)}`
        )
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

    processedQueries.set(filePath, query)
  }

  return processedQueries
}

const determineUsedFragmentsForDefinition = (
  definition,
  definitionsByName,
  fragmentsUsedByFragment,
  visitedFragmentDefinitions = new Set()
) => {
  const { def, name, isFragment, filePath } = definition
  const cachedUsedFragments = fragmentsUsedByFragment.get(name)
  if (cachedUsedFragments) {
    return { usedFragments: cachedUsedFragments, missingFragments: [] }
  } else {
    const usedFragments = new Set()
    const missingFragments = []
    visit(def, {
      [Kind.FRAGMENT_SPREAD]: node => {
        const name = node.name.value
        const fragmentDefinition = definitionsByName.get(name)
        if (visitedFragmentDefinitions.has(fragmentDefinition)) {
          return
        }
        visitedFragmentDefinitions.add(fragmentDefinition)
        if (fragmentDefinition) {
          usedFragments.add(name)
          const {
            usedFragments: usedFragmentsForFragment,
            missingFragments: missingFragmentsForFragment,
          } = determineUsedFragmentsForDefinition(
            fragmentDefinition,
            definitionsByName,
            fragmentsUsedByFragment,
            visitedFragmentDefinitions
          )
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
const addExtraFields = (document, schema) => {
  const typeInfo = new TypeInfo(schema)
  const contextStack = []

  const transformer = visitWithTypeInfo(typeInfo, {
    enter: {
      [Kind.SELECTION_SET]: node => {
        // Entering selection set:
        //   selection sets can be nested, so keeping their metadata stacked
        contextStack.push({ hasTypename: false, hasId: false })
      },
      [Kind.FIELD]: node => {
        // Entering a field of the current selection-set:
        //   mark which fields already exist in this selection set to avoid duplicates
        const context = contextStack[contextStack.length - 1]
        if (node.name.value === `__typename`) {
          context.hasTypename = true
        }
        if (node.name.value === `id`) {
          context.hasId = true
        }
      },
    },
    leave: {
      [Kind.SELECTION_SET]: node => {
        // Modify the selection-set AST on leave (add extra fields unless they already exist)
        const context = contextStack.pop()
        const parentType = typeInfo.getParentType()
        const extraFields = []

        // Adding __typename to unions and interfaces (if required)
        if (!context.hasTypename && isAbstractType(parentType)) {
          extraFields.push({
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: `__typename` },
          })
        }
        if (
          !context.hasId &&
          (isObjectType(parentType) || isInterfaceType(parentType)) &&
          hasIdField(parentType)
        ) {
          extraFields.push({
            kind: Kind.FIELD,
            name: { kind: Kind.NAME, value: `id` },
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

const hasIdField = type => {
  const idField = type.getFields()[`id`]
  const fieldType = idField ? String(idField.type) : ``
  return fieldType === `ID` || fieldType === `ID!`
}
