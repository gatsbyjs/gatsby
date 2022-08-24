import { createPath } from "gatsby-page-utils"
import { reverseLookupParams } from "./extract-query"
import { getCollectionRouteParams } from "./get-collection-route-params"
import { derivePath } from "./derive-path"
import type { CreatePagesArgs, PluginOptions } from "gatsby"
import sysPath from "path"

export const pluginInstances = new Map()

function createPathFromNode({ filePath, node, reporter, slugifyOptions }) {
  console.log(`IN createPathFromNode, our new filePath: ${filePath}`)
  const { derivedPath, errors } = derivePath(
    filePath,
    node,
    reporter,
    slugifyOptions
  )
  return { path: createPath(derivedPath), errors }
}

export function createPagesFromChangedNodes(
  { actions, reporter, tick }: CreatePagesArgs,
  pluginOptions: PluginOptions
): void {
  // Loop over deleted/created nodes and delete nodes and create nodes
  // we haven't seen before and then reset arrays.
  const trackedTypes = pluginInstances.get(pluginOptions.path)

  console.log({ pluginInstances, trackedTypes })

  if (trackedTypes?.size > 0) {
    console.log({
      trackedTypes,
      pluginInstances,
      tick,
    })

    const nodeTypes = Array.from(trackedTypes.keys())
    console.log({ nodeTypes })

    // Loop through deleted nodes and delete any tracked pages
    Array.from(tick.get(`changedNodes`).deleted.values()).forEach(
      ({ node }) => {
        if (nodeTypes.includes(node.internal.type)) {
          const absolutePath = trackedTypes.get(node.internal.type).absolutePath
          const { path, errors } = createPathFromNode({
            filePath: sysPath.relative(pluginOptions.path, absolutePath),
            node,
            reporter,
            slugifyOptions: pluginOptions.slugifyOptions,
          })
          console.log(`deleting page`, { path, component: absolutePath })
          actions.deletePage({ path, component: absolutePath })
        }
      }
    )

    // Loop through created nodes and create pages for them.
    Array.from(tick.get(`changedNodes`).created.values()).forEach(
      ({ node }) => {
        if (nodeTypes.includes(node.internal.type)) {
          const absolutePath = trackedTypes.get(node.internal.type).absolutePath
          const { path, errors } = createPathFromNode({
            filePath: sysPath.relative(pluginOptions.path, absolutePath),
            node,
            reporter,
            slugifyOptions: pluginOptions.slugifyOptions,
          })

          const params = getCollectionRouteParams(
            createPath(absolutePath),
            path
          )
          // nodeParams is fed to the graphql query for the component
          const nodeParams = reverseLookupParams(node, absolutePath)

          console.log(`creating page`, {
            path: path,
            component: trackedTypes.get(node.internal.type).absolutePath,
            context: {
              ...nodeParams,
              __params: params,
            },
          })
          actions.createPage({
            path: path,
            component: trackedTypes.get(node.internal.type).absolutePath,
            context: {
              ...nodeParams,
              __params: params,
            },
          })
        }
      }
    )
  }
}
