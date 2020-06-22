import { babelParseToAst } from "gatsby/dist/utils/babel-parse-to-ast"
import { generateQueryFromString } from "./extract-query"
import fs from "fs-extra"
import traverse, { NodePath } from "@babel/traverse"
import generate from "@babel/generator"
import * as t from "@babel/types"

function isCreatePagesFromData(path: NodePath<t.CallExpression>): boolean {
  return (
    (path.node.callee.type === `MemberExpression` &&
      path.node.callee.property.name === `createPagesFromData` &&
      path.get(`callee`).get(`object`).referencesImport(`gatsby`)) ||
    (path.node.callee.name === `createPagesFromData` &&
      path.get(`callee`).referencesImport(`gatsby`))
  )
}

// This Function opens up the actual collection file and extracts the queryString used in the
// `createPagesFromData` macro.
export function collectionExtractQueryString(
  absolutePath: string
): string | null {
  let queryString: string | null = null
  let callsiteExpression
  let isExportedAsDefault

  // 1.  Convert the file to a babel ast
  const ast = babelParseToAst(
    fs.readFileSync(absolutePath).toString(),
    absolutePath
  ) as t.Node

  // 2.  Traverse the AST to find the createPagesFromData macro
  traverse(ast, {
    // The createPagesFromData is always a CallExpression
    CallExpression(path) {
      // 2.a.  But there are other callExpressions, so first we need to confirm that it is specifically
      //       the createPagesFromData node that we are acting on.
      if (!isCreatePagesFromData(path)) return

      // We save the callsiteExpression just for better logging to the user.
      callsiteExpression = generate(path.node).code

      // 2.b  The query is always the second argument to the function
      const [, queryAst] = path.node.arguments
      let string = ``

      // The query could be a template literal, e.g. backticks ``
      if (t.isTemplateLiteral(queryAst)) {
        string = queryAst.quasis[0].value.raw
      }

      // Or it could be a normal string
      if (t.isStringLiteral(queryAst)) {
        string = queryAst.value
      }

      // We want the convention to be that you export default the createPagesFromData builder,
      // so this check ensures that if they haven't done that we prevent things from going on.
      isExportedAsDefault = t.isExportDefaultDeclaration(path.container)

      // 2.c  This is important, we get the string, but we have to create a full graphql
      //      query from it. This generateQueryFromString call does all of that magic
      queryString = generateQueryFromString(string, absolutePath)
    },
  })

  // 3. log error and exit early if they did not export default createPagesFromData
  if (isExportedAsDefault === false) {
    console.error(`CollectionBuilderError:
  The createPagesFromData call in ${
    absolutePath.split("src/pages")[1]
  } needs to be exported as default like this:

export default ${callsiteExpression};
`)
    return null
  }
  // 4. If we couldnt find the queryString for any other reason, then we log that
  else if (!queryString) {
    console.error(
      `CollectionBuilder: There was an error generating pages from your collection.

FilePath: ${absolutePath.split("src/pages")[1]}
Function: ${callsiteExpression}
    `
    )
  }

  return queryString
}
