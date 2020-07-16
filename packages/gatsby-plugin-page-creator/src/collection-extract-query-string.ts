import { babelParseToAst } from "gatsby/dist/utils/babel-parse-to-ast"
import { generateQueryFromString } from "./extract-query"
import { getGraphQLTag } from "babel-plugin-remove-graphql-queries"
import fs from "fs-extra"
import traverse from "@babel/traverse"

// This Function opens up the actual collection file and extracts the queryString used in the
// `unstable_createPagesFromData` macro.
export function collectionExtractQueryString(
  absolutePath: string
): string | null {
  let queryString: string | null = null

  // 1.  Convert the file to a babel ast
  const ast = babelParseToAst(
    fs.readFileSync(absolutePath).toString(),
    absolutePath
  )

  const modelType = /\{([a-zA-Z]+):/.exec(absolutePath)?.[1]

  if (!modelType) {
    throw new Error(`You screwed up`)
  }

  // 2.  Traverse the AST to find the unstable_createPagesFromData macro
  traverse(ast, {
    ExportNamedDeclaration(path) {
      if (path.node.source) {
        return
      }
      path.traverse({
        TaggedTemplateExpression(path) {
          const { text } = getGraphQLTag(path, `unstable_collectionGraphql`)
          if (!text) return

          if (text.includes(`...CollectionPagesQueryFragment`) === false) {
            throw new Error(
              `Your collection graphql query is incorrect. You must use the fragment "...CollectionPagesQueryFragment" to pull data nodes`
            )
          }

          queryString = text
        },
      })
    },
  })

  // 3  This is important, we get the model or query, but we have to create a real graphql
  //    query from it. This generateQueryFromString call does all of that magic
  queryString = generateQueryFromString(queryString || modelType, absolutePath)

  return queryString
}
