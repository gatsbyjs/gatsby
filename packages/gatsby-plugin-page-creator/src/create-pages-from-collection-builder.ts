// Move this to gatsby-core-utils?
import { Actions, CreatePagesArgs } from "gatsby"
import { generateQueryFromString, reverseLookupParams } from "./extract-query"
import { getMatchPath } from "./get-match-path"
import { createPath } from "gatsby-page-utils"
import { getParams } from "./get-params"
import { babelParseToAst } from "gatsby/dist/utils/babel-parse-to-ast"
import { derivePath } from "./derive-path"
import fs from "fs-extra"
import traverse, { NodePath } from "@babel/traverse"
import * as t from "@babel/types"

// Changes something like
//   `/Users/site/src/pages/foo/{id}/`
// to
//   `/foo/:id`
function translateInterpolationToMatchPath(createdPath: string): string {
  const [, path] = createdPath.split(`src/pages`)
  return path.replace(`{`, `:`).replace(`}`, ``).replace(/\/$/, ``)
}

function isCreatePagesFromData(path: NodePath<t.CallExpression>): boolean {
  const callee = path.get(`callee`).get(`object`)
  let hasReference = false
  
  if (Array.isArray(callee)) {
    hasReference = callee[0].referencesImport(`gatsby`, `createPagesFromData`)
  } else {
    hasReference = callee.referencesImport(`gatsby`, `createPagesFromData`)
  }

  return (
    (path.node.callee.type === `MemberExpression` &&
      path.node.callee.property.name === `createPagesFromData`
       && hasReference
  )
}

// TODO: Do we need the ignore argument?
exports.createPagesFromCollectionBuilder = async function createPagesFromCollectionBuilder(
  absolutePath: string,
  actions: Actions,
  graphql: CreatePagesArgs["graphql"]
): Promise<void> {
  const [, route] = absolutePath.split(`src/pages`)

  const ast = babelParseToAst(
    fs.readFileSync(absolutePath).toString(),
    absolutePath
  ) as t.Node

  let queryString = ``

  traverse(ast, {
    // TODO: Throw an error if this is not the export default ? just to encourage default habits
    CallExpression(path) {
      if (!isCreatePagesFromData(path)) return
      if (!t.isCallExpression(path)) return // this might not be needed...

      const [, queryAst] = path.node.arguments
      let string = ""

      if (t.isTemplateLiteral(queryAst)) {
        string = queryAst.quasis[0].value.raw
      }
      if (t.isStringLiteral(queryAst)) {
        string = queryAst.value
      }

      queryString = generateQueryFromString(string, absolutePath)
    },
  })

  const { data, errors } = await graphql<{nodes: Record<string, unknown>}>(queryString)

  if (!data || errors) {
    console.warn(`Tried to create pages from the collection builder found at ${route}.
Unfortunately, the query came back empty. There may be an error in your query.`)
    console.error(errors)
    return
  }

  const rootKey = /^\{([a-zA-Z]+)/.exec(queryString)

  if (!rootKey || !rootKey[0]) {
    throw new Error(
      `An internal error occured, if you experience this please an open an issue. Problem: Couldn't resolve the graphql keys in collection builder`
    )
  }

  const nodes = data[rootKey[0]].nodes

  if (nodes) {
    console.log(`>>>> Creating ${nodes.length} pages from ${route}`)
  }

  nodes.forEach(node => {
    const matchPath = translateInterpolationToMatchPath(
      createPath(absolutePath)
    )

    const path = createPath(derivePath(absolutePath, node))
    const params = getParams(matchPath, path)

    const nodeParams = reverseLookupParams(node, absolutePath)

    actions.createPage({
      path: path,
      ...getMatchPath(path),
      component: absolutePath,
      context: {
        ...nodeParams,
        __params: params,
      },
    })
  })
}
