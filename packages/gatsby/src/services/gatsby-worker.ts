import { outputFile } from "fs-extra"
import * as path from "path"
import { generatePageDataPath } from "gatsby-core-utils/page-data"
import { generateHtmlPath } from "gatsby-core-utils/page-html"

import type { IDataTrackingResult } from "../schema/graphql-engine/entry"

exports.GENERATE_PAGE = async ({ args }): Promise<IDataTrackingResult> => {
  let hadError = false
  let stopCollectingAndGetActionsToReplay = (): void => {}
  const actionsToReplay: IDataTrackingResult["actionsToReplay"] = []

  try {
    const root = global.__GATSBY?.root ?? process.cwd()
    const publicDir = path.join(root, `public`)

    const { GraphQLEngine } =
      require(`${root}/.cache/query-engine`) as typeof import("../schema/graphql-engine/entry")

    const graphqlEngine = new GraphQLEngine({
      dbPath: `${root}/.cache/data/datastore`,
    })

    const { getData, renderHTML, renderPageData } =
      require(`${root}/.cache/page-ssr`) as typeof import("../utils/page-ssr-module/entry")

    await graphqlEngine.ready()

    stopCollectingAndGetActionsToReplay =
      graphqlEngine.startCollectDataTrackingActions(actionsToReplay)

    for (const requestPath of args.paths) {
      try {
        const data = await getData({
          graphqlEngine,
          pathName: requestPath,
          // spanContext: span.spanContext(),
          // telemetryResolverTimings: resolverTimings,
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
  } catch (e) {
    console.error(e)
    hadError = true
  }

  if (hadError) {
    throw new Error(`There was a problem (see errors before this message)`)
  }

  stopCollectingAndGetActionsToReplay()

  return { actionsToReplay }
}
