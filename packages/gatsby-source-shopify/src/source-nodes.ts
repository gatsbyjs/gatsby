import { SourceNodesArgs } from "gatsby"

import { updateCache } from "./update-cache"
import { createOperations } from "./create-operations"
import { makeSourceFromOperation } from "./source-from-operation"
import {
  isPriorityBuild,
  getLastBuildTime,
  setCurrentBuildTime,
} from "./helpers"

export async function sourceNodes(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions
): Promise<void> {
  const { shopifyConnections: connections = [] } = pluginOptions

  gatsbyApi.reporter.info(
    `Running ${isPriorityBuild(pluginOptions) ? `` : `non-`}priority queries`
  )

  setCurrentBuildTime(gatsbyApi, pluginOptions)
  const lastBuildTime = getLastBuildTime(gatsbyApi, pluginOptions)

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
    await updateCache(gatsbyApi, pluginOptions, lastBuildTime)
  }
}
