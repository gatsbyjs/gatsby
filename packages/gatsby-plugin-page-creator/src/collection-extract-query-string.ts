import { generateQueryFromString } from "./extract-query"
import fs from "fs-extra"
import { Reporter } from "gatsby/reporter"
import { extractModel } from "./path-utils"
import { CODES, prefixId } from "./error-utils"

// This Function opens up the actual collection file and extracts the queryString used in the
export function collectionExtractQueryString(
  absolutePath: string,
  reporter: Reporter,
  nodeIds?: Array<string>
): string | null {
  let queryString: string | null = null

  const modelType = extractModel(absolutePath)

  // This can happen if you have an invalid path and you are trying to query for that path
  // our path graphql resolution logic does not validate the path before calling this
  // so it can hit this case.
  if (!modelType) return null

  // 1.  Read the file and scan for a use of collectionGraphql
  const fileContents = fs.readFileSync(absolutePath).toString()

  // 2.  If the user is using the collectionGraphql function, we have to
  //     warn that this functionality was removed
  if (
    fileContents.includes(`collectionGraphql`) ||
    fileContents.includes(`unstable_collectionGraphql`)
  ) {
    reporter.panicOnBuild({
      id: prefixId(CODES.CollectionGraphQL),
      context: {
        sourceMessage: `The "collectionGraphql" (or "unstable_collectionGraphql") API was removed. Please use the "createPages" API instead to filter collection routes.`,
      },
      filePath: absolutePath,
    })
  }

  // 3  This is important, we get the model or query, but we have to create a real graphql
  //    query from it. This generateQueryFromString call does all of that magic
  queryString = generateQueryFromString(modelType, absolutePath, nodeIds)

  return queryString
}
