// @flow
import path from "path"
const normalize = require(`normalize-path`)
import glob from "glob"

import { validate } from "graphql"
import { IRTransforms } from "relay-compiler"
import RelayParser from "relay-compiler/lib/RelayParser"
import ASTConvert from "relay-compiler/lib/ASTConvert"
import GraphQLCompilerContext from "relay-compiler/lib/GraphQLCompilerContext"
import filterContextForNode from "relay-compiler/lib/filterContextForNode"
const _ = require(`lodash`)

import { store } from "../../redux"
import FileParser from "./file-parser"
import GraphQLIRPrinter from "relay-compiler/lib/GraphQLIRPrinter"
import {
  graphqlError,
  graphqlValidationError,
  multipleRootQueriesError,
} from "./graphql-errors"
import report from "gatsby-cli/lib/reporter"

import type { DocumentNode, GraphQLSchema } from "graphql"

const { printTransforms } = IRTransforms

const {
  ArgumentsOfCorrectTypeRule,
  DefaultValuesOfCorrectTypeRule,
  FragmentsOnCompositeTypesRule,
  KnownTypeNamesRule,
  LoneAnonymousOperationRule,
  PossibleFragmentSpreadsRule,
  ScalarLeafsRule,
  VariablesAreInputTypesRule,
  VariablesInAllowedPositionRule,
} = require(`graphql`)

type RootQuery = {
  name: string,
  path: string,
  text: string,
}

type Queries = Map<string, RootQuery>

const validationRules = [
  ArgumentsOfCorrectTypeRule,
  DefaultValuesOfCorrectTypeRule,
  FragmentsOnCompositeTypesRule,
  KnownTypeNamesRule,
  LoneAnonymousOperationRule,
  PossibleFragmentSpreadsRule,
  ScalarLeafsRule,
  VariablesAreInputTypesRule,
  VariablesInAllowedPositionRule,
]

class Runner {
  baseDir: string
  schema: GraphQLSchema
  fragmentsDir: string

  constructor(baseDir: string, fragmentsDir: string, schema: GraphQLSchema) {
    this.baseDir = baseDir
    this.fragmentsDir = fragmentsDir
    this.schema = schema
  }

  reportError(message) {
    if (process.env.NODE_ENV === `production`) {
      report.panic(`${report.format.red(`GraphQL Error`)} ${message}`)
    } else {
      report.log(`${report.format.red(`GraphQL Error`)} ${message}`)
    }
  }

  async compileAll() {
    let nodes = await this.parseEverything()
    return await this.write(nodes)
  }

  async parseEverything() {
    // FIXME: this should all use gatsby's configuration to determine parsable
    // files (and how to parse them)
    let files = glob.sync(`${this.fragmentsDir}/**/*.+(t|j)s?(x)`, {
      nodir: true,
    })
    files = files.concat(
      glob.sync(`${this.baseDir}/**/*.+(t|j)s?(x)`, { nodir: true })
    )
    files = files.filter(d => !d.match(/\.d\.ts$/))
    files = files.map(normalize)

    // Ensure all page components added as they're not necessarily in the
    // pages directory e.g. a plugin could add a page component.  Plugins
    // *should* copy their components (if they add a query) to .cache so that
    // our babel plugin to remove the query on building is active (we don't
    // run babel on code in node_modules). Otherwise the component will throw
    // an error in the browser of "graphql is not defined".
    files = files.concat(
      Object.keys(store.getState().components).map(c => normalize(c))
    )
    files = _.uniq(files)

    let parser = new FileParser()

    return await parser.parseFiles(files)
  }

  async write(nodes: Map<string, DocumentNode>): Promise<Queries> {
    const compiledNodes: Queries = new Map()
    const namePathMap = new Map()
    const nameDefMap = new Map()
    const documents = []

    for (let [filePath, doc] of nodes.entries()) {
      let errors = validate(this.schema, doc, validationRules)

      if (errors && errors.length) {
        this.reportError(graphqlValidationError(errors, filePath))
        return compiledNodes
      }

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
      this.reportError(graphqlError(namePathMap, nameDefMap, error))
      return compiledNodes
    }

    const printContext = printTransforms.reduce(
      (ctx, transform) => transform(ctx, this.schema),
      compilerContext
    )

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
        return
      }

      let text = filterContextForNode(printContext.getRoot(name), printContext)
        .documents()
        .map(GraphQLIRPrinter.print)
        .join(`\n`)

      compiledNodes.set(filePath, {
        name,
        text,
        path: path.join(this.baseDir, filePath),
      })
    })

    return compiledNodes
  }
}
export { Runner }

export default async function compile(): Promise<Map<string, RootQuery>> {
  const { program, schema } = store.getState()

  const runner = new Runner(
    `${program.directory}/src`,
    `${program.directory}/.cache/fragments`,
    schema
  )

  const queries = await runner.compileAll()

  return queries
}
