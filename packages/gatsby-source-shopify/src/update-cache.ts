import { SourceNodesArgs } from "gatsby"

import { eventsApi } from "./events"
import { shopifyTypes } from "./shopify-types"
import { createNodeId, parseShopifyId } from "./helpers"

const deletionCounter: { [key: string]: number } = {}

/**
 * invalidateNode - Recursive function that returns an array of node ids that are invalidated
 * @param gatsbyApi - Gatsby Helpers
 * @param pluginOptions - Plugin Options Object
 * @param id - The root node to invalidate
 *
 * Note: This function is designed to receive a single top-level node on the first pass
 * and then call itself recuresively afterwards for each nested layer of coupled nodes
 */
function invalidateNode(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions,
  id: string,
  invalidatedNodeIds = new Set<string>()
): Set<string> {
  const { typePrefix } = pluginOptions

  const node = gatsbyApi.getNode(id)

  if (node) {
    invalidatedNodeIds.add(node.id)
    const type = node.internal.type.replace(`${typePrefix}Shopify`, ``)
    const { coupledNodeFields } = shopifyTypes[type]

    if (coupledNodeFields) {
      for (const field of coupledNodeFields) {
        for (const coupledNodeId of node[field] as Array<string>) {
          invalidateNode(
            gatsbyApi,
            pluginOptions,
            coupledNodeId,
            invalidatedNodeIds
          )
        }
      }
    }
  }

  return invalidatedNodeIds
}

function reportNodeDeletion(
  gatsbyApi: SourceNodesArgs,
  node: IShopifyNode
): void {
  const type = parseShopifyId(node.shopifyId)[1]
  deletionCounter[type] = (deletionCounter[type] || 0) + 1

  const identifier = node.shopifyId
    ? `shopify ID: ${node.shopifyId}`
    : `internal ID: ${node.id}`

  gatsbyApi.reporter.info(`Deleting ${type} node with ${identifier}`)
}

function reportDeletionSummary(gatsbyApi: SourceNodesArgs): void {
  gatsbyApi.reporter.info(`===== SHOPIFY NODE DELETION SUMMARY =====`)

  for (const [key, value] of Object.entries(deletionCounter)) {
    gatsbyApi.reporter.info(`${key}: ${value}`)
  }
}

export async function updateCache(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions,
  lastBuildTime: Date
): Promise<void> {
  const { fetchDestroyEventsSince } = eventsApi(pluginOptions)
  const destroyEvents = await fetchDestroyEventsSince(lastBuildTime)

  const invalidatedNodeIds = new Set<string>()
  for (const value of destroyEvents) {
    const shopifyId = `gid://shopify/${value.subject_type}/${value.subject_id}`
    const nodeId = createNodeId(shopifyId, gatsbyApi, pluginOptions)
    invalidateNode(gatsbyApi, pluginOptions, nodeId, invalidatedNodeIds)
  }

  // don't block event loop for too long
  await new Promise(resolve => setImmediate(resolve))

  for (const shopifyType of Object.keys(shopifyTypes)) {
    {
      // closure so we can let Node GC `nodes` (if needed) before next iteration
      const nodes = gatsbyApi.getNodesByType(
        `${pluginOptions.typePrefix}Shopify${shopifyType}`
      ) as Array<IShopifyNode>

      for (const node of nodes) {
        if (invalidatedNodeIds.has(node.id)) {
          gatsbyApi.actions.deleteNode(node)
          reportNodeDeletion(gatsbyApi, node)
        } else {
          gatsbyApi.actions.touchNode(node)
        }
      }
    }

    // don't block event loop for too long
    await new Promise(resolve => setImmediate(resolve))
  }

  if (invalidatedNodeIds.size > 0) {
    reportDeletionSummary(gatsbyApi)
  }
}
