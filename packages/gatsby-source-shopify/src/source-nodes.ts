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
import { valid } from "joi"

interface ICachedShopifyNode extends IShopifyNode, NodeInput {}

interface ICachedShopifyNodeMap {
  [key: string]: ICachedShopifyNode
}

/**
 * validateNodes - Recursive function that returns an array of node ids that are validated
 * @param gatsbyApi - Gatsby Helpers
 * @param pluginOptions - Plugin Options Object
 * @param nodeMap - Map Object of all nodes that haven't been deleted
 * @param nodes - Array of nodes to validate
 *
 * Note: This function is designed to receive all top-level nodes on the first pass
 * and then call itself recuresively afterwards for each coupled node field on the provided nodes
 */
function validateNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions,
  nodeMap: ICachedShopifyNodeMap,
  nodes: Array<ICachedShopifyNode>
): Array<string> {
  const validatedNodeIds: Array<string> = []

  for (const node of nodes) {
    validatedNodeIds.push(node.id)

    const type = parseShopifyId(node.shopifyId)[1]
    const coupledNodeFields = shopifyTypes[type].coupledNodeFields

    if (coupledNodeFields) {
      const coupledNodes = coupledNodeFields
        .map(field => node[field].map((id: string) => nodeMap[id]))
        .reduce((acc, value) => acc.concat(value), [])

      validatedNodeIds.concat(
        validateNodes(gatsbyApi, pluginOptions, nodeMap, coupledNodes)
      )
    }
  }

  return [...new Set(validatedNodeIds)]
}

export async function sourceNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions
): Promise<void> {
  const { typePrefix = ``, shopifyConnections: connections = [] } =
    pluginOptions

  const lastBuildTime = getLastBuildTime(gatsbyApi, pluginOptions)

  if (lastBuildTime !== undefined) {
    gatsbyApi.reporter.info(`Running an incremental build`)
  } else {
    gatsbyApi.reporter.info(`Running a clean build`)
  }

  const {
    productsOperation,
    productVariantsOperation,
    ordersOperation,
    collectionsOperation,
    locationsOperation,
    finishLastOperation,
    completedOperation,
    cancelOperationInProgress,
  } = createOperations(gatsbyApi, pluginOptions)

  const sourceFromOperation = makeSourceFromOperation(
    finishLastOperation,
    completedOperation,
    cancelOperationInProgress,
    gatsbyApi,
    pluginOptions
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

    if (destroyEvents.length > 0) {
      gatsbyApi.reporter.info(`Removing matching nodes from Gatsby`)
    }

    destroyEvents.forEach(event => {
      const shopifyId = `gid://shopify/${event.subject_type}/${event.subject_id}`
      const id = createNodeId(shopifyId, gatsbyApi, pluginOptions)
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

    const deletionCounter: { [key: string]: number } = {}

    for (const node of Object.values(nodeMap)) {
      if (validatedNodeIds.includes(node.id)) {
        gatsbyApi.actions.touchNode(node)
      } else {
        const type = parseShopifyId(node.shopifyId)[1]
        deletionCounter[type] = (deletionCounter[type] || 0) + 1

        const identifier = node.shopifyId
          ? `shopify ID: ${node.shopifyId}`
          : `internal ID: ${node.id}`

        gatsbyApi.reporter.info(`Deleting ${type} node with ${identifier}`)
      }
    }

    // If Nodes were deleted
    if (Object.values(nodeMap).length > validatedNodeIds.length) {
      gatsbyApi.reporter.info(`===== NODE DELETION SUMMARY =====`)
      for (const [key, value] of Object.entries(deletionCounter)) {
        gatsbyApi.reporter.info(`${key}: ${value}`)
      }
    }
  }

  gatsbyApi.reporter.info(`Finished sourcing nodes, caching last build time`)
  setLastBuildTime(gatsbyApi, pluginOptions)
}
