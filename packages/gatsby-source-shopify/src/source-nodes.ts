import { SourceNodesArgs } from "gatsby"

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

interface INodeMap {
  [key: string]: IShopifyNode
}

function getNodesToDelete(
  gatsbyApi: SourceNodesArgs,
  nodeMap: INodeMap,
  ids: Array<string>
): Array<string> {
  const nodesToDelete: Array<string> = []

  for (const id of ids) {
    const node = nodeMap[id]

    if (node) {
      gatsbyApi.reporter.info(
        `Removing node with Shopify ID: ${node.shopifyId}`
      )
      const type = parseShopifyId(node.shopifyId)[1]
      const coupledNodeFields = shopifyTypes[type].coupledNodeFields

      const coupledNodeIdsToDelete: Array<string> = []

      if (coupledNodeFields) {
        const coupledNodeIds = coupledNodeFields
          .map((field: string) => node[field])
          .reduce(
            (acc: Array<string>, value: Array<string>) => acc.concat(value),
            []
          )

        getNodesToDelete(gatsbyApi, nodeMap, coupledNodeIds)
      }

      return [...new Set([...coupledNodeIdsToDelete, id])]
    } else {
      console.error(`Could not find a node with ID: ${id}`)
    }
  }

  return nodesToDelete
}

export async function sourceNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions
): Promise<void> {
  const { typePrefix = ``, shopifyConnections: connections = [] } =
    pluginOptions

  const lastBuildTime = getLastBuildTime(gatsbyApi, pluginOptions)

  if (lastBuildTime !== undefined) {
    gatsbyApi.reporter.info(`Cache is warm, running an incremental build`)
  } else {
    gatsbyApi.reporter.info(`Cache is cold, running a clean build`)
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
    console.log(`starting building node map`)

    const nodes = Object.keys(shopifyTypes)
      .map(type => gatsbyApi.getNodesByType(`${typePrefix}Shopify${type}`))
      .reduce((acc, value) => acc.concat(value), [])

    const nodeMap: INodeMap = nodes.reduce((acc, value) => {
      return { ...acc, [value.id]: value }
    }, {})

    console.log(`finished building node map`)

    const { fetchDestroyEventsSince } = eventsApi(pluginOptions)
    const destroyEvents = await fetchDestroyEventsSince(lastBuildTime)

    gatsbyApi.reporter.info(
      `${destroyEvents.length} items have been deleted since ${lastBuildTime}`
    )

    if (destroyEvents.length) {
      gatsbyApi.reporter.info(`Removing matching nodes from Gatsby`)

      const destroyedNodeIds = destroyEvents.map(event => {
        const shopifyId = `gid://shopify/${event.subject_type}/${event.subject_id}`
        return createNodeId(shopifyId, gatsbyApi, pluginOptions)
      })

      const allDestroyedNodeIds = getNodesToDelete(
        gatsbyApi,
        nodeMap,
        destroyedNodeIds
      )

      for (const node of nodes) {
        if (!allDestroyedNodeIds.includes(node.id)) {
          gatsbyApi.actions.touchNode(node)
        }
      }
    }
  }

  gatsbyApi.reporter.info(`Finished sourcing nodes, caching last build time`)
  setLastBuildTime(gatsbyApi, pluginOptions)
}
