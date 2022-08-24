import { createPath } from "gatsby-page-utils"
import { reverseLookupParams } from "./extract-query"
import { getCollectionRouteParams } from "./get-collection-route-params"
import { derivePath } from "./derive-path"
import type { CreatePagesArgs } from "gatsby"
import sysPath from "path"
import { getPluginInstance } from "./tracked-nodes-state"
import { IOptions } from "./types"

function createPathFromNode({ filePath, node, reporter, slugifyOptions }): {
  path: string
  errors: number
} {
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
  { actions, reporter }: Pick<CreatePagesArgs, "actions" | "reporter">,
  pluginOptions: IOptions
): void {
  // Loop over deleted/created nodes and delete nodes and create nodes
  // we haven't seen before and then reset arrays.
  const pluginInstance = getPluginInstance(pluginOptions)

  const nodeTypes = Array.from(pluginInstance.trackedTypes.keys())

  for (const {
    node,
  } of pluginInstance.changedNodesFromLastPageCreation.deleted.values()) {
    if (nodeTypes.includes(node.internal.type)) {
      const absolutePaths = pluginInstance.trackedTypes.get(node.internal.type)
      if (absolutePaths) {
        for (const absolutePath of absolutePaths) {
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
    }
  }

  for (const {
    node,
  } of pluginInstance.changedNodesFromLastPageCreation.created.values()) {
    if (nodeTypes.includes(node.internal.type)) {
      const absolutePaths = pluginInstance.trackedTypes.get(node.internal.type)
      if (absolutePaths) {
        for (const absolutePath of absolutePaths) {
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
          const nodeParams = reverseLookupParams(node as any, absolutePath)

          console.log(`creating page`, {
            path: path,
            component: absolutePath,
            context: {
              ...nodeParams,
              __params: params,
            },
          })
          actions.createPage({
            path: path,
            component: absolutePath,
            context: {
              ...nodeParams,
              __params: params,
            },
          })
        }
      }
    }
  }

  // TODO: handle pluginInstance.changedNodesFromLastPageCreation.updated

  // clear changed nodes
  pluginInstance.changedNodesFromLastPageCreation = {
    created: new Map(),
    deleted: new Map(),
    updated: new Map(),
  }
}
