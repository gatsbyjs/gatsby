// @flow
import path from "path"
import glob from "glob"
import Bluebird from "bluebird"
import invariant from "invariant"
import { IRTransforms } from "relay-compiler"
import ASTConvert from "relay-compiler/lib/ASTConvert"
import RelayCompilerContext from "relay-compiler/lib/RelayCompilerContext"
import filterContextForNode from "relay-compiler/lib/filterContextForNode"
const _ = require(`lodash`)

import { store } from "../../redux"
import FileParser from "./file-parser"
import QueryPrinter from "./query-printer"

import type { DocumentNode, GraphQLSchema } from "graphql"

const { printTransforms } = IRTransforms
const globp = Bluebird.promisify(glob)

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

class Runner {
  baseDir: string
  schema: GraphQLSchema

  constructor(baseDir: string, schema: GraphQLSchema) {
    this.baseDir = baseDir
    this.schema = schema
  }

  async compileAll() {
    let nodes = await this.parseEverything()
    return this.write(nodes)
  }

  async parseEverything() {
    let files = await globp(`${this.baseDir}/**/*.js`)
    files = files.map(path.normalize)
    // Ensure all page components added as they're not necessarily in the
    // pages directory e.g. a plugin could add a page component.  Plugins
    // *should* copy their components (if they add a query) to .cache so that
    // our babel plugin to remove the query on building is active (we don't
    // run babel on code in node_modules). Otherwise the component will throw
    // an error in the browser of "graphql is not defined".
    files = files.concat(
      store.getState().pages.map(p => path.normalize(p.component))
    )
    files = _.uniq(files)
    console.log("file paths for compiling", files)

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
        `Gatsby: Pages may only specify one "root" query tag. ` +
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

export default function compile(): Promise<Map<string, RootQuery>> {
  const { program, schema } = store.getState()

  const runner = new Runner(`${program.directory}/src`, schema)

  return runner.compileAll()
}
