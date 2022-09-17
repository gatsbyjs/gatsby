import { createPath } from "gatsby-page-utils"
import { reverseLookupParams } from "./extract-query"
import { getCollectionRouteParams } from "./get-collection-route-params"
import { derivePath } from "./derive-path"
import type { CreatePagesArgs } from "gatsby"
import sysPath from "path"
import { getPluginInstance, IStatePerInstance } from "./tracked-nodes-state"
import { IOptions } from "./types"

function createPathFromNode({ filePath, node, reporter, slugifyOptions }): {
  path: string
  errors: number
} {
  const { derivedPath, errors } = derivePath(
    filePath,
    node,
    reporter,
    slugifyOptions
  )
  return { path: createPath(derivedPath), errors }
}

export function createPagesFromChangedNodes(
  {
    actions,
    reporter,
  }: Pick<CreatePagesArgs, "actions" | "reporter"> & {
    pluginInstance: IStatePerInstance
  },
  pluginOptions: IOptions
): void {
  // Loop over deleted/created nodes and delete nodes and create nodes
  // we haven't seen before and then reset arrays.
  const pluginInstance = getPluginInstance(pluginOptions)

  if (pluginInstance.trackedTypes.size === 0) {
    return
  }

  for (const {
    node,
  } of pluginInstance.changedNodesSinceLastPageCreation.deleted.values()) {
    if (pluginInstance.trackedTypes.has(node.internal.type)) {
      const absolutePaths = pluginInstance.trackedTypes.get(node.internal.type)
      if (absolutePaths) {
        for (const absolutePath of absolutePaths) {
          const { path } = createPathFromNode({
            filePath: sysPath.relative(pluginOptions.path, absolutePath),
            node,
            reporter,
            slugifyOptions: pluginOptions.slugifyOptions,
          })
          actions.deletePage({ path, component: absolutePath })
        }
      }
    }
  }

  for (const {
    node,
  } of pluginInstance.changedNodesSinceLastPageCreation.created.values()) {
    if (pluginInstance.trackedTypes.has(node.internal.type)) {
      const absolutePaths = pluginInstance.trackedTypes.get(node.internal.type)
      if (absolutePaths) {
        for (const absolutePath of absolutePaths) {
          const { path } = createPathFromNode({
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

  for (const {
    node,
    oldNode,
  } of pluginInstance.changedNodesSinceLastPageCreation.updated.values()) {
    if (pluginInstance.trackedTypes.has(node.internal.type)) {
      const absolutePaths = pluginInstance.trackedTypes.get(node.internal.type)
      if (absolutePaths) {
        for (const absolutePath of absolutePaths) {
          const { path: pathForANewNode } = createPathFromNode({
            filePath: sysPath.relative(pluginOptions.path, absolutePath),
            node,
            reporter,
            slugifyOptions: pluginOptions.slugifyOptions,
          })

          const { path: pathForOldNode } = createPathFromNode({
            filePath: sysPath.relative(pluginOptions.path, absolutePath),
            node: oldNode,
            reporter,
            slugifyOptions: pluginOptions.slugifyOptions,
          })

          if (pathForANewNode !== pathForOldNode) {
            actions.deletePage({
              path: pathForOldNode,
              component: absolutePath,
            })

            const params = getCollectionRouteParams(
              createPath(absolutePath),
              pathForANewNode
            )
            // nodeParams is fed to the graphql query for the component
            const nodeParams = reverseLookupParams(node as any, absolutePath)

            actions.createPage({
              path: pathForANewNode,
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
  }

  // clear changed nodes
  pluginInstance.changedNodesSinceLastPageCreation = {
    created: new Map(),
    deleted: new Map(),
    updated: new Map(),
  }
}
