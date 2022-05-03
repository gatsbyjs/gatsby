import { outputFile } from "fs-extra"
import * as path from "path"
import { generatePageDataPath } from "gatsby-core-utils/page-data"
import { generateHtmlPath } from "gatsby-core-utils/page-html"
import { v4 } from "gatsby-core-utils/uuid"
import type { GraphQLEngine } from "../schema/graphql-engine/entry"

let graphqlEngine: GraphQLEngine
function getGraphqlEngine(): GraphQLEngine {
  if (!graphqlEngine) {
    const root = global.__GATSBY?.root ?? process.cwd()
    const { GraphQLEngine } = require(`${root}/.cache/query-engine`) as {
      GraphQLEngine
    }
    graphqlEngine = new GraphQLEngine({
      dbPath: `${root}/.cache/data/datastore`,
      trackActions: true,
    })
  }

  return graphqlEngine
}

exports.GENERATE_PAGE = async ({ args }): Promise<void> => {
  let hadError = false
  try {
    const root = global.__GATSBY?.root ?? process.cwd()
    const publicDir = path.join(root, `public`)

    const graphqlEngine = getGraphqlEngine()

    const { getData, renderHTML, renderPageData } =
      require(`${root}/.cache/page-ssr`) as typeof import("../utils/page-ssr-module/entry")

    await graphqlEngine.ready()

    const requestId = v4()
    for (const requestPath of args.paths) {
      try {
        const data = await getData({
          graphqlEngine,
          pathName: requestPath,
          // spanContext: span.spanContext(),
          // telemetryResolverTimings: resolverTimings,
          requestId,
        })
        const pageData = await renderPageData({
          data,
        })
        const html = await renderHTML({
          data,
          pageData,
        })
        // write out results
        await outputFile(
          generatePageDataPath(publicDir, requestPath),
          JSON.stringify(pageData)
        )
        await outputFile(generateHtmlPath(publicDir, requestPath), html)
      } catch (e) {
        console.error(e)
        hadError = true
      }
    }

    console.log(
      `${requestId} with ${graphqlEngine.getTrackedActions(requestId).length}`
    )
  } catch (e) {
    console.error(e)
    hadError = true
  }

  if (hadError) {
    throw new Error(`There was a problem (see errors before this message)`)
  }
}
