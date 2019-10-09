// @flow
import path from "path"
const normalize = require(`normalize-path`)
import glob from "glob"
const levenshtein = require(`fast-levenshtein`)

import { validate } from "graphql"
import { IRTransforms } from "@gatsbyjs/relay-compiler"
import RelayParser from "@gatsbyjs/relay-compiler/lib/RelayParser"
import ASTConvert from "@gatsbyjs/relay-compiler/lib/ASTConvert"
import GraphQLCompilerContext from "@gatsbyjs/relay-compiler/lib/GraphQLCompilerContext"
import filterContextForNode from "@gatsbyjs/relay-compiler/lib/filterContextForNode"
import getGatsbyDependents from "../utils/gatsby-dependents"
const _ = require(`lodash`)

import { store } from "../redux"
const { boundActionCreators } = require(`../redux/actions`)
import FileParser from "./file-parser"
import GraphQLIRPrinter from "@gatsbyjs/relay-compiler/lib/GraphQLIRPrinter"
import {
  graphqlError,
  graphqlValidationError,
  multipleRootQueriesError,
} from "./graphql-errors"
import report from "gatsby-cli/lib/reporter"
import errorParser from "./error-parser"
const websocketManager = require(`../utils/websocket-manager`)

import type { DocumentNode, GraphQLSchema } from "graphql"

const { printTransforms } = IRTransforms

const {
  ValuesOfCorrectTypeRule,
  FragmentsOnCompositeTypesRule,
  KnownTypeNamesRule,
  LoneAnonymousOperationRule,
  PossibleFragmentSpreadsRule,
  ScalarLeafsRule,
  VariablesAreInputTypesRule,
  VariablesInAllowedPositionRule,
  Kind,
  print,
} = require(`graphql`)

type RootQuery = {
  name: string,
  path: string,
  text: string,
  originalText: string,
  isStaticQuery: boolean,
  hash: string,
}

type Queries = Map<string, RootQuery>

const validationRules = [
  ValuesOfCorrectTypeRule,
  FragmentsOnCompositeTypesRule,
  KnownTypeNamesRule,
  LoneAnonymousOperationRule,
  PossibleFragmentSpreadsRule,
  ScalarLeafsRule,
  VariablesAreInputTypesRule,
  VariablesInAllowedPositionRule,
]

let lastRunHadErrors = null
const overlayErrorID = `graphql-compiler`

const resolveThemes = (themes = []) =>
  themes.reduce((merged, theme) => {
    merged.push(theme.themeDir)
    return merged
  }, [])

class Runner {
  base: string
  additional: string[]
  schema: GraphQLSchema
  errors: string[]
  fragmentsDir: string

  constructor(
    base: string,
    additional: string[],
    schema: GraphQLSchema,
    { parentSpan } = {}
  ) {
    this.base = base
    this.additional = additional
    this.schema = schema
    this.parentSpan = parentSpan
  }

  reportError(message) {
    const queryErrorMessage = `${report.format.red(`GraphQL Error`)} ${message}`
    if (process.env.gatsby_executing_command === `develop`) {
      websocketManager.emitError(overlayErrorID, queryErrorMessage)
      lastRunHadErrors = true
    }
  }

  async compileAll() {
    let nodes = await this.parseEverything()
    return await this.write(nodes)
  }

  async parseEverything() {
    const filesRegex = `*.+(t|j)s?(x)`
    // Pattern that will be appended to searched directories.
    // It will match any .js, .jsx, .ts, and .tsx files, that are not
    // inside <searched_directory>/node_modules.
    const pathRegex = `/{${filesRegex},!(node_modules)/**/${filesRegex}}`

    const modulesThatUseGatsby = await getGatsbyDependents()

    let files = [
      path.join(this.base, `src`),
      path.join(this.base, `.cache`, `fragments`),
      ...this.additional.map(additional => path.join(additional, `src`)),
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

    let parser = new FileParser({ parentSpan: this.parentSpan })

    return await parser.parseFiles(files)
  }

  async write(nodes: Map<string, DocumentNode>): Promise<Queries> {
    const compiledNodes: Queries = new Map()
    const namePathMap = new Map()
    const nameDefMap = new Map()
    const nameErrorMap = new Map()
    const documents = []
    const fragmentMap = new Map()

    for (let [filePath, doc] of nodes.entries()) {
      let errors = validate(this.schema, doc, validationRules)

      if (errors && errors.length) {
        const locationOfGraphQLDocInSourceFile = doc.definitions[0].templateLoc

        report.panicOnBuild(
          errors.map(error => {
            const graphqlLocation = error.locations[0]
            // get location of error relative to soure file (not just graphql text)
            const location = {
              start: {
                line:
                  graphqlLocation.line +
                  locationOfGraphQLDocInSourceFile.start.line -
                  1,
                column:
                  (graphqlLocation.line === 0
                    ? locationOfGraphQLDocInSourceFile.start.column - 1
                    : 0) + graphqlLocation.column,
              },
            }
            return errorParser({ message: error.message, filePath, location })
          })
        )

        this.reportError(graphqlValidationError(errors, filePath))
        boundActionCreators.queryExtractionGraphQLError({
          componentPath: filePath,
        })
        return compiledNodes
      }

      // The way we currently export fragments requires duplicated ones
      // to be filtered out since there is a global Fragment namespace
      // We maintain a top level fragment Map to keep track of all definitions
      // of the fragment type and to filter them out if theythey've already been
      // declared before
      doc.definitions = doc.definitions.filter(definition => {
        if (definition.kind === Kind.FRAGMENT_DEFINITION) {
          const fragmentName = definition.name.value
          if (fragmentMap.has(fragmentName)) {
            if (print(definition) === fragmentMap.get(fragmentName)) {
              return false
            }
          } else {
            fragmentMap.set(fragmentName, print(definition))
          }
        }
        return true
      })

      documents.push(doc)
      doc.definitions.forEach((def: any) => {
        const name: string = def.name.value
        namePathMap.set(name, filePath)
        nameDefMap.set(name, def)
      })
    }

    let compilerContext = new GraphQLCompilerContext(this.schema)
    try {
      compilerContext = compilerContext.addAll(
        ASTConvert.convertASTDocuments(
          this.schema,
          documents,
          validationRules,
          RelayParser.transform.bind(RelayParser)
        )
      )
    } catch (error) {
      const { formattedMessage, docName, message, codeBlock } = graphqlError(
        namePathMap,
        nameDefMap,
        error
      )
      nameErrorMap.set(docName, { formattedMessage, message, codeBlock })
      boundActionCreators.queryExtractionGraphQLError({
        componentPath: namePathMap.get(docName),
        error: formattedMessage,
      })

      const filePath = namePathMap.get(docName)
      const structuredError = errorParser({ message, filePath })
      report.panicOnBuild(structuredError)

      // report error to browser
      // TODO: move browser error overlay reporting to reporter
      this.reportError(formattedMessage)

      return false
    }

    // relay-compiler v1.5.0 added "StripUnusedVariablesTransform" to
    // printTransforms. Unfortunately it currently doesn't detect variables
    // in input objects widely used in gatsby, and therefore removing
    // variable declaration from queries.
    // As a temporary workaround remove that transform by slicing printTransforms.
    const printContext = printTransforms
      .slice(0, -1)
      .reduce((ctx, transform) => transform(ctx, this.schema), compilerContext)

    const fragments = []
    compilerContext.documents().forEach(node => {
      if (node.kind === `Fragment`) {
        fragments.push(node.name)
      }
    })

    compilerContext.documents().forEach((node: { name: string }) => {
      if (node.kind !== `Root`) return
      const { name } = node
      let filePath = namePathMap.get(name) || ``
      if (compiledNodes.has(filePath)) {
        let otherNode = compiledNodes.get(filePath)
        this.reportError(
          multipleRootQueriesError(
            filePath,
            nameDefMap.get(name),
            otherNode && nameDefMap.get(otherNode.name)
          )
        )
        boundActionCreators.queryExtractionGraphQLError({
          componentPath: filePath,
        })
        return
      }
      let text
      try {
        text = filterContextForNode(printContext.getRoot(name), printContext)
          .documents()
          .map(GraphQLIRPrinter.print)
          .join(`\n`)
      } catch (error) {
        const regex = /Unknown\sdocument\s`(.*)`/gm
        const str = error.toString()
        let m

        let fragmentName
        while ((m = regex.exec(str)) !== null) {
          // This is necessary to avoid infinite loops with zero-width matches
          if (m.index === regex.lastIndex) regex.lastIndex++

          fragmentName = m[1]
        }

        const closestFragment = fragments
          .map(f => {
            return { fragment: f, score: levenshtein.get(fragmentName, f) }
          })
          .filter(f => f.score < 10)
          .sort((a, b) => a.score > b.score)[0]?.fragment

        report.panicOnBuild({
          id: `85908`,
          filePath,
          context: { fragmentName, closestFragment },
        })
      }

      const query = {
        name,
        text,
        originalText: nameDefMap.get(name).text,
        path: filePath,
        isHook: nameDefMap.get(name).isHook,
        isStaticQuery: nameDefMap.get(name).isStaticQuery,
        hash: nameDefMap.get(name).hash,
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

      compiledNodes.set(filePath, query)
    })

    if (
      process.env.gatsby_executing_command === `develop` &&
      lastRunHadErrors
    ) {
      websocketManager.emitError(overlayErrorID, null)
      lastRunHadErrors = false
    }

    return compiledNodes
  }
}
export { Runner, resolveThemes }

export default async function compile({ parentSpan } = {}): Promise<
  Map<string, RootQuery>
> {
  // TODO: swap plugins to themes
  const { program, schema, themes, flattenedPlugins } = store.getState()

  const runner = new Runner(
    program.directory,
    resolveThemes(
      themes.themes
        ? themes.themes
        : flattenedPlugins.map(plugin => {
            return {
              themeDir: plugin.pluginFilepath,
            }
          })
    ),
    schema,
    { parentSpan }
  )

  const queries = await runner.compileAll()

  return queries
}
