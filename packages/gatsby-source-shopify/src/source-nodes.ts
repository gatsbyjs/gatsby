import { SourceNodesArgs, NodeInput } from "gatsby"

import { eventsApi } from "./events"
import { shopifyTypes } from "./shopify-types"
import { createOperations } from "./create-operations"
import { makeSourceFromOperation } from "./source-from-operation"
import {
  createNodeId,
  parseShopifyId,
  getLastBuildTime,
  setLastBuildTime,
} from "./helpers"

interface ICachedShopifyNode extends IShopifyNode, NodeInput {}

interface ICachedShopifyNodeMap {
  [key: string]: ICachedShopifyNode
}

const deletionCounter: { [key: string]: number } = {}

/**
 * validateNodes - Recursive function that returns an array of node ids that are validated
 * @param gatsbyApi - Gatsby Helpers
 * @param pluginOptions - Plugin Options Object
 * @param nodeMap - Map Object of all nodes that haven't been deleted
 * @param nodes - Array of nodes to validate
 *
 * Note: This function is designed to receive all top-level nodes on the first pass
 * and then call itself recuresively afterwards for each nested layer of coupled nodes
 */
function validateNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions,
  nodeMap: ICachedShopifyNodeMap,
  nodes: Array<ICachedShopifyNode>,
  prevalidatedNodeIds?: Array<string>
): Array<string> {
  let coupledNodeIds: Array<string> = []
  let validatedNodeIds: Array<string> = []

  for (const node of nodes) {
    if (
      !validatedNodeIds.includes(node.id) &&
      !prevalidatedNodeIds?.includes(node.id)
    ) {
      validatedNodeIds.push(node.id)

      const type = parseShopifyId(node.shopifyId)[1]
      const coupledNodeFields = shopifyTypes[type].coupledNodeFields

      if (coupledNodeFields) {
        for (const field of coupledNodeFields) {
          coupledNodeIds = coupledNodeIds.concat(node[field])
        }
      }
    }
  }

  if (coupledNodeIds.length > 0) {
    const coupledNodes = [...new Set(coupledNodeIds)].map(id => nodeMap[id])

    validatedNodeIds = validatedNodeIds.concat(
      validateNodes(
        gatsbyApi,
        pluginOptions,
        nodeMap,
        coupledNodes,
        validatedNodeIds
      )
    )
  }

  return [...new Set(validatedNodeIds)]
}

function reportNodeDeletion(
  gatsbyApi: SourceNodesArgs,
  node: ICachedShopifyNode
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

export async function sourceNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions
): Promise<void> {
  const { typePrefix = ``, shopifyConnections: connections = [] } =
    pluginOptions

  /* There is the potential for sync issues due to this. We use the lastBuildTime both
   * to query for changed nodes from Shopify, and to determine which nodes have been deleted.
   * If we do it at the beginning, there is the potential for us to reload the same changed
   * nodes in multiple subsequent builds. This is less of a concern that if we put it at the
   * end of the build, which would have the potential of not catching top-level nodes deleted
   * in Shopify during the build process. A clean build would be required after that in order
   * to remove the node as it wouldn't be removed in subsquent builds.
   */
  const lastBuildTime = getLastBuildTime(gatsbyApi, pluginOptions)
  setLastBuildTime(gatsbyApi, pluginOptions)

  const {
    productsOperation,
    productVariantsOperation,
    ordersOperation,
    collectionsOperation,
    locationsOperation,
    finishLastOperation,
    completedOperation,
    cancelOperationInProgress,
  } = createOperations(gatsbyApi, pluginOptions, lastBuildTime)

  const sourceFromOperation = makeSourceFromOperation(
    finishLastOperation,
    completedOperation,
    cancelOperationInProgress,
    gatsbyApi,
    pluginOptions,
    lastBuildTime
  )

  const operations = [productsOperation, productVariantsOperation]

  if (connections.includes(`orders`)) {
    operations.push(ordersOperation)
  }

  if (connections.includes(`collections`)) {
    operations.push(collectionsOperation)
  }

  if (connections.includes(`locations`)) {
    operations.push(locationsOperation)
  }

  for (const op of operations) {
    await sourceFromOperation(op)
  }

  if (lastBuildTime) {
    const nodeMap: ICachedShopifyNodeMap = Object.keys(shopifyTypes)
      .map(type => gatsbyApi.getNodesByType(`${typePrefix}Shopify${type}`))
      .reduce((acc, value) => acc.concat(value), [])
      .reduce((acc, value) => {
        return { ...acc, [value.id]: value }
      }, {})

    const { fetchDestroyEventsSince } = eventsApi(pluginOptions)
    const destroyEvents = await fetchDestroyEventsSince(lastBuildTime)

    destroyEvents.forEach(event => {
      const shopifyId = `gid://shopify/${event.subject_type}/${event.subject_id}`
      const id = createNodeId(shopifyId, gatsbyApi, pluginOptions)
      reportNodeDeletion(gatsbyApi, nodeMap[id])
      delete nodeMap[id]
    })

    const topLevelNodes = Object.values(nodeMap).filter(node => {
      const type = parseShopifyId(node.shopifyId)[1]
      return !shopifyTypes[type].coupled
    })

    const validatedNodeIds = validateNodes(
      gatsbyApi,
      pluginOptions,
      nodeMap,
      topLevelNodes
    )

    for (const node of Object.values(nodeMap)) {
      if (validatedNodeIds.includes(node.id)) {
        gatsbyApi.actions.touchNode(node)
      } else {
        reportNodeDeletion(gatsbyApi, node)
      }
    }

    if (Object.values(nodeMap).length > validatedNodeIds.length) {
      reportDeletionSummary(gatsbyApi)
    }
  }
}
