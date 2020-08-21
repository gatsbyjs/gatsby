import { Actions, CreatePagesArgs, Reporter } from "gatsby"
import { collectionExtractQueryString } from "./collection-extract-query-string"
import systemPath from "path"
import { IPluginState } from "../types"
import { trackFeatureIsUsed } from "gatsby-telemetry"
import { createPath } from "gatsby-page-utils"
import { getCollectionRouteParams } from "./get-collection-route-params"
import { derivePath } from "./derive-path"
import { reverseLookupParams } from "./extract-query"
import { getMatchPath } from "../client-routes/get-match-path"

export async function applyIncrementalBuildPatches(
  path: string,
  nodes: IPluginState["nodes"],
  graphql: CreatePagesArgs["graphql"],
  reporter: Reporter,
  actions: Actions
): Promise<void> {
  trackFeatureIsUsed(`UnifiedRoutes:collection-page-builder`)
  if (!process.env.GATSBY_EXPERIMENTAL_ROUTING_APIS) {
    throw new Error(
      `PageCreator: Found a collection route, but the proper env was not set to enable this experimental feature. Please run again with \`GATSBY_EXPERIMENTAL_ROUTING_APIS=1\` to enable.`
    )
  }

  const pagesDirectory = systemPath.resolve(process.cwd(), path)

  await Promise.all(
    nodes.map(async ({ node, files }) => {
      await Promise.all(
        files.map(async filePath => {
          const absolutePath = systemPath.join(pagesDirectory, filePath)
          // 1. Query for the data for the collection to generate pages
          const queryString = collectionExtractQueryString(
            absolutePath,
            reporter
          )

          if (queryString === null) {
            // Maybe throw an error? Not sure, an incremental update shouldn't really hit a dead end if it works on the first build
            return
          }

          const { data, errors } = await graphql<{
            nodes: Record<string, unknown>
          }>(queryString)

          if (!data || errors) {
            // Maybe throw an error? Not sure, an incremental update shouldn't really hit a dead end if it works on the first build
            return
          }

          // 2. Get the nodes out of the data. We very much expect data to come back in a known shape:
          //    data = { [key: string]: { nodes: Array<ACTUAL_DATA> } }
          const nodes = (Object.values(
            Object.values(data)[0]
          )[0] as any) as Array<Record<string, object>>

          // TODO: Verify the node exists in the resulted values. There is a chance it is not part of it because of filters or groupings, etc.

          // URL path for the component and node
          const path = createPath(derivePath(filePath, node, reporter))
          // Params is supplied to the FE component on props.params
          const params = getCollectionRouteParams(createPath(filePath), path)
          // nodeParams is fed to the graphql query for the component
          const nodeParams = reverseLookupParams(node as any, absolutePath)
          // matchPath is an optional value. It's used if someone does a path like `{foo}/[bar].js`
          const matchPath = getMatchPath(path)

          if (nodes) {
            reporter.info(
              `   PageCreator: Applying patch for ${node.internal.type} (${node.id}) from ${filePath}` +
                `\n` +
                `   See the update at ${path}`
            )
          }

          actions.createPage({
            path: path,
            matchPath,
            component: absolutePath,
            context: {
              ...nodeParams,
              __params: params,
            },
          })
        })
      )
    })
  )

  // I think I need to make this conditional on if the apply was for the right path
  actions.setPluginStatus({ isInBootstrap: false, nodes: [] })
}
