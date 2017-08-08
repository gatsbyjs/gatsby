// @flow
import path from "path"
const normalize = require(`normalize-path`)
import glob from "glob"
import invariant from "invariant"
import { IRTransforms } from "relay-compiler"
import ASTConvert from "relay-compiler/lib/ASTConvert"
import RelayCompilerContext from "relay-compiler/lib/RelayCompilerContext"
import filterContextForNode from "relay-compiler/lib/filterContextForNode"
const _ = require(`lodash`)

import { store } from "../../redux"
import FileParser from "./file-parser"
import QueryPrinter from "./query-printer"
import report from "../../utils/reporter"
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

const findFilePath = (docs, docName, pathMap) => {
  let filePath = null
  docs.find(doc => doc.definitions.find((node: any) => {
    const { name: { value } } = node
    if (value === docName) {
      filePath = pathMap.get(value) || ``
      return true
    }
    return false
  }))
  return filePath
}

function extractError(error: Error) {
  const docRegex = /Invariant Violation: RelayParser: (.*). Source: document `(.*)` file:/g
  let matches, message, docName
  while ((matches = docRegex.exec(error.toString())) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (matches.index === docRegex.lastIndex) docRegex.lastIndex++
    ;[, message, docName] = matches
  }
  return { message, docName }
}

class Runner {
  baseDir: string
  schema: GraphQLSchema

  constructor(baseDir: string, schema: GraphQLSchema) {
    this.baseDir = baseDir
    this.schema = schema
  }

  async compileAll() {
    let nodes = await this.parseEverything()
    return await this.write(nodes)
  }

  async parseEverything() {
    let files = glob.sync(`${this.baseDir}/**/*.+(t|j)s?(x)`)
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

  async write(nodes: Map<string, DocumentNode>) {
    const namePathMap = new Map()
    const documents = []

    nodes.forEach((doc, filePath) => {
      documents.push(doc)
      doc.definitions.forEach((def: any) => {
        const name: string = def.name.value
        namePathMap.set(name, filePath)
      })
    })

    let compilerContext = new RelayCompilerContext(this.schema)
    try {
      compilerContext = compilerContext.addAll(
        ASTConvert.convertASTDocuments(this.schema, documents, [
          ArgumentsOfCorrectTypeRule,
          DefaultValuesOfCorrectTypeRule,
          FragmentsOnCompositeTypesRule,
          KnownTypeNamesRule,
          LoneAnonymousOperationRule,
          PossibleFragmentSpreadsRule,
          ScalarLeafsRule,
          VariablesAreInputTypesRule,
          VariablesInAllowedPositionRule,
        ])
      )
    } catch (error) {
      let { message, docName } = extractError(error)
      let filePath = findFilePath(documents, docName, namePathMap)

      if (filePath && docName) {
        error.message = message
        report.error(
          `There was an error while compiling your site's GraphQL queries in ` +
          `document "${docName}" in file "${filePath}".`,
          error
        )
      } else {
        report.error(
          `There was an error while compiling your site's GraphQL queries`,
          error
        )
      }
    }

    const printContext = printTransforms.reduce(
      (ctx, transform) => transform(ctx, this.schema),
      compilerContext
    )

    const compiledNodes: Map<string, RootQuery> = new Map()

    compilerContext.documents().forEach((node: { name: string }) => {
      if (node.kind !== `Root`) return

      const { name } = node
      let filePath = namePathMap.get(name) || ``

      invariant(
        !compiledNodes.has(filePath),
        `Gatsby: Components may only specify one "root" query tag. ` +
          `Combine them into a single query`
      )

      let text = filterContextForNode(printContext.getRoot(name), printContext)
        .documents()
        .map(QueryPrinter.print)
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

export default async function compile(): Promise<Map<string, RootQuery>> {
  const { program, schema } = store.getState()

  const runner = new Runner(`${program.directory}/src`, schema)

  const queries = await runner.compileAll()

  return queries
}
