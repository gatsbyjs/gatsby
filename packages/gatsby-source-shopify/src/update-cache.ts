import { SourceNodesArgs } from "gatsby"

import { eventsApi } from "./events"
import { shopifyTypes } from "./shopify-types"
import { createNodeId, parseShopifyId } from "./helpers"

const deletionCounter: { [key: string]: number } = {}

/**
 * invalidateNode - Recursive function that returns an array of node ids that are invalidated
 * @param gatsbyApi - Gatsby Helpers
 * @param pluginOptions - Plugin Options Object
 * @param nodeMap - Map Object of all nodes that haven't been deleted
 * @param id - The root node to invalidate
 *
 * Note: This function is designed to receive a single top-level node on the first pass
 * and then call itself recuresively afterwards for each nested layer of coupled nodes
 */
function invalidateNode(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions,
  nodeMap: IShopifyNodeMap,
  id: string
): Array<string> {
  const { typePrefix } = pluginOptions

  const node = nodeMap[id]
  let invalidatedNodeIds: Array<string> = []

  if (node) {
    invalidatedNodeIds.push(node.id)
    const type = node.internal.type.replace(`${typePrefix}Shopify`, ``)
    const { coupledNodeFields } = shopifyTypes[type]

    if (coupledNodeFields) {
      for (const field of coupledNodeFields) {
        for (const coupledNodeId of node[field] as Array<string>) {
          invalidatedNodeIds = invalidatedNodeIds.concat(
            invalidateNode(gatsbyApi, pluginOptions, nodeMap, coupledNodeId)
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
  const { typePrefix } = pluginOptions

  const nodeMap: IShopifyNodeMap = Object.keys(shopifyTypes)
    .map(type => gatsbyApi.getNodesByType(`${typePrefix}Shopify${type}`))
    .reduce((acc, value) => acc.concat(value), [])
    .reduce((acc, value) => {
      return { ...acc, [value.id]: value }
    }, {})

  const { fetchDestroyEventsSince } = eventsApi(pluginOptions)
  const destroyEvents = await fetchDestroyEventsSince(lastBuildTime)

  const invalidatedNodeIds = destroyEvents.reduce<Array<string>>(
    (acc, value) => {
      const shopifyId = `gid://shopify/${value.subject_type}/${value.subject_id}`
      const nodeId = createNodeId(shopifyId, gatsbyApi, pluginOptions)
      return acc.concat(
        invalidateNode(gatsbyApi, pluginOptions, nodeMap, nodeId)
      )
    },
    []
  )

  for (const node of Object.values(nodeMap)) {
    if (invalidatedNodeIds.includes(node.id)) {
      gatsbyApi.actions.deleteNode(node)
      reportNodeDeletion(gatsbyApi, node)
    } else {
      gatsbyApi.actions.touchNode(node)
    }
  }

  if (invalidatedNodeIds.length > 0) {
    reportDeletionSummary(gatsbyApi)
  }
}
