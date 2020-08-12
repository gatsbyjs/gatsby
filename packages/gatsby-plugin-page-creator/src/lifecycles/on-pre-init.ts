import glob from "globby"
import { ParentSpanPluginArgs } from "gatsby"
import { IOptions } from "../types"
import systemPath from "path"
import { parse } from "graphql"
import { collectionExtractQueryString } from "../collection-routes/collection-extract-query-string"
import knownCollections from "../known-collections"

export async function onPreInit(
  { reporter }: ParentSpanPluginArgs,
  { path: pagesPath }: IOptions
): Promise<void> {
  try {
    const pagesGlob = `**/\\{*\\}**`

    const files = await glob(pagesGlob, { cwd: pagesPath })

    await Promise.all(
      files.map(async relativePath => {
        const absolutePath = require.resolve(
          systemPath.join(pagesPath, relativePath)
        )
        const queryString = await collectionExtractQueryString(
          absolutePath,
          reporter
        )
        if (!queryString) return
        const ast = parse(queryString)
        knownCollections.set(
          // @ts-ignore
          ast.definitions[0].selectionSet.selections[0].name.value,
          relativePath
        )
      })
    )
  } catch (e) {
    reporter.panic(
      e.message.startsWith(`PageCreator`)
        ? e.message
        : `PageCreator: ${e.message}`
    )
  }
}
