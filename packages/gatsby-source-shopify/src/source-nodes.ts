import { SourceNodesArgs } from "gatsby"

import { eventsApi } from "./events"
import { shopifyTypes } from "./shopify-types"
import { createOperations } from "./create-operations"
import { createNodeId, parseShopifyId } from "./helpers"
import { makeSourceFromOperation } from "./source-from-operation"

const getStatus = (gatsbyApi: SourceNodesArgs) =>
  gatsbyApi.store.getState().status.plugins?.[`gatsby-source-shopify`] || []

interface NodeMap {
  [key: string]: ShopifyNode
}


function getNodesToDelete(gatsbyApi: SourceNodesArgs, nodeMap: NodeMap, ids: string[]) {
  const nodesToDelete: string[] = []

  for (const id of ids) {
    const node = nodeMap[id]

    if (node) {
      gatsbyApi.reporter.info(
        `Removing node with Shopify ID: ${node.shopifyId}`
      )
      const type = parseShopifyId(node.shopifyId)[1]
      const coupledNodeFields = shopifyTypes[type].coupledNodeFields

      const coupledNodeIdsToDelete: [string?] = []

      if (coupledNodeFields) {
        const coupledNodeIds = coupledNodeFields
          .map((field: string) => node[field])
          .reduce((acc: string[], value: string[]) => acc.concat(value), [])

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
  pluginOptions: ShopifyPluginOptions
): Promise<void> {
  const { typePrefix = ``, shopifyConnections: connections = [] } = pluginOptions

  const status = getStatus(gatsbyApi)
  const lastBuildTime = status[`lastBuildTime${typePrefix}`] && new Date(status[`lastBuildTime${typePrefix}`])

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
    console.log('starting building node map');

    const nodes = Object.keys(shopifyTypes)
      .map((type) => gatsbyApi.getNodesByType(`${typePrefix}Shopify${type}`))
      .reduce((acc, value) => acc.concat(value), [])

    const nodeMap: NodeMap = nodes.reduce((acc, value) => ({ ...acc, [value.id]: value}), {})

    console.log('finished building node map');

    const { fetchDestroyEventsSince } = eventsApi(pluginOptions)
    const destroyEvents = await fetchDestroyEventsSince(lastBuildTime)

    gatsbyApi.reporter.info(
      `${destroyEvents.length} items have been deleted since ${lastBuildTime}`
    )

    if (destroyEvents.length) {
      gatsbyApi.reporter.info(`Removing matching nodes from Gatsby`)

      const destroyedNodeIds = destroyEvents.map((event) => {
        const shopifyId = `gid://shopify/${event.subject_type}/${event.subject_id}`
        return createNodeId(shopifyId, gatsbyApi, pluginOptions)
      })

      const allDestroyedNodeIds = getNodesToDelete(gatsbyApi, nodeMap, destroyedNodeIds)

      for (const node of nodes) {
        if (!allDestroyedNodeIds.includes(node.id)) {
          gatsbyApi.actions.touchNode(node)
        }
      }
    }
  }

  gatsbyApi.reporter.info(`Finished sourcing nodes, caching last build time`)
  gatsbyApi.actions.setPluginStatus({
    ...status,
    [`lastBuildTime${typePrefix}`]: Date.now(),
  })
}
