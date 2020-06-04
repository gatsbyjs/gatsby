// Move this to gatsby-core-utils?
import { Actions, CreatePagesArgs } from "gatsby"
import { generateQueryFromString, reverseLookupParams } from "./extract-query"
import { getMatchPath } from "./get-match-path"
import { createPath } from "gatsby-page-utils"
import { getCollectionRouteParams } from "./get-collection-route-params"
import { babelParseToAst } from "gatsby/dist/utils/babel-parse-to-ast"
import { derivePath } from "./derive-path"
import fs from "fs-extra"
import traverse, { NodePath } from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"
import { string } from "joi"

function isCreatePagesFromData(path: NodePath<t.CallExpression>): boolean {
  return (
    (path.node.callee.type === `MemberExpression` &&
      path.node.callee.property.name === `createPagesFromData` &&
      path.get(`callee`).get(`object`).referencesImport(`gatsby`)) ||
    (path.node.callee.name === `createPagesFromData` &&
      path.get(`callee`).referencesImport(`gatsby`))
  )
}

// TODO: Do we need the ignore argument?
export async function createPagesFromCollectionBuilder(
  filePath: string,
  absolutePath: string,
  actions: Actions,
  graphql: CreatePagesArgs["graphql"]
): Promise<void> {
  const ast = babelParseToAst(
    fs.readFileSync(absolutePath).toString(),
    absolutePath
  ) as t.Node

  let queryString
  let callsiteExpression

  traverse(ast, {
    // TODO: Throw an error if this is not the export default ? just to encourage default habits
    CallExpression(path) {
      if (!isCreatePagesFromData(path)) return
      if (!t.isCallExpression(path)) return // this might not be needed...

      callsiteExpression = generate(path.node).code
      const [, queryAst] = path.node.arguments
      let string = ``

      if (t.isTemplateLiteral(queryAst)) {
        string = queryAst.quasis[0].value.raw
      }
      if (t.isStringLiteral(queryAst)) {
        string = queryAst.value
      }

      queryString = generateQueryFromString(string, absolutePath)
    },
  })

  if (!queryString) {
    throw new Error(
      `CollectionBuilder: There was an error generating pages from your collection.

FilePath: ${filePath}
Function: ${callsiteExpression}
    `
    )
  }

  const { data, errors } = await graphql<{ nodes: Record<string, unknown> }>(
    queryString
  )

  if (!data || errors) {
    console.warn(`Tried to create pages from the collection builder found at ${filePath}.
Unfortunately, the query came back empty. There may be an error in your query.`)
    console.error(errors)
    return
  }

  const rootKey = /^\{([a-zA-Z]+)/.exec(queryString)

  if (!rootKey || !rootKey[1]) {
    throw new Error(
      `An internal error occured, if you experience this please an open an issue. Problem: Couldn't resolve the graphql keys in collection builder`
    )
  }

  const nodes = data[rootKey[1]].nodes

  if (nodes) {
    console.info(`CollectionPageCreator:`)
    console.info(`   Creating ${nodes.length} pages from ${filePath}`)
  }

  nodes.forEach((node: Record<string, unknown>) => {
    const path = createPath(derivePath(absolutePath, node))
    const params = getCollectionRouteParams(createPath(filePath), path)

    const nodeParams = reverseLookupParams(node, absolutePath)
    const matchPath = getMatchPath(path)
    console.info(`   ${matchPath.matchPath || path}`)

    actions.createPage({
      path: path,
      ...matchPath,
      component: absolutePath,
      context: {
        ...nodeParams,
        __params: params,
      },
    })
  })
}
