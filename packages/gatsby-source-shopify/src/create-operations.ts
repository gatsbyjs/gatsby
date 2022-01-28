import { SourceNodesArgs } from "gatsby"
import { shiftLeft } from "shift-left"

import { createGraphqlClient } from "./clients"
import { OperationError } from "./errors"

import { ProductsQuery } from "./query-builders/products-query"
import { ProductVariantsQuery } from "./query-builders/product-variants-query"
import { CollectionsQuery } from "./query-builders/collections-query"
import { OrdersQuery } from "./query-builders/orders-query"
import { LocationsQuery } from "./query-builders/locations-query"

import {
  OPERATION_STATUS_QUERY,
  OPERATION_BY_ID,
  CANCEL_OPERATION,
} from "./static-queries"

interface IOperations {
  productsOperation: IShopifyBulkOperation
  productVariantsOperation: IShopifyBulkOperation
  ordersOperation: IShopifyBulkOperation
  collectionsOperation: IShopifyBulkOperation
  locationsOperation: IShopifyBulkOperation
  cancelOperationInProgress: () => Promise<void>
  cancelOperation: (id: string) => Promise<IBulkOperationCancelResponse>
  finishLastOperation: () => Promise<void>
  completedOperation: (
    operationId: string,
    interval?: number
  ) => Promise<{ node: IBulkOperationNode }>
}

const finishedStatuses = [`COMPLETED`, `FAILED`, `CANCELED`, `EXPIRED`]
const failedStatuses = [`FAILED`, `CANCELED`]

export function createOperations(
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions,
  lastBuildTime?: Date
): IOperations {
  const graphqlClient = createGraphqlClient(pluginOptions)
  const operationNamePrefix = lastBuildTime ? `INCREMENTAL_` : ``

  function createOperation(
    operationQuery: string,
    name: string
  ): IShopifyBulkOperation {
    return {
      execute: (): Promise<IBulkOperationRunQueryResponse> =>
        graphqlClient.request<IBulkOperationRunQueryResponse>(operationQuery),
      name: `${operationNamePrefix}${name}`,
    }
  }

  function currentOperation(): Promise<ICurrentBulkOperationResponse> {
    return graphqlClient.request(OPERATION_STATUS_QUERY)
  }

  async function finishLastOperation(): Promise<void> {
    let { currentBulkOperation } = await currentOperation()
    if (currentBulkOperation && currentBulkOperation.id) {
      const timer = gatsbyApi.reporter.activityTimer(
        `Waiting for operation ${currentBulkOperation.id} : ${currentBulkOperation.status}`
      )
      timer.start()

      while (!finishedStatuses.includes(currentBulkOperation.status)) {
        await new Promise(resolve => setTimeout(resolve, 1000))
        currentBulkOperation = (await currentOperation()).currentBulkOperation
        timer.setStatus(
          `Polling operation ${currentBulkOperation.id} : ${currentBulkOperation.status}`
        )
      }

      timer.end()
    }
  }

  async function cancelOperation(
    id: string
  ): Promise<IBulkOperationCancelResponse> {
    return graphqlClient.request<IBulkOperationCancelResponse>(
      CANCEL_OPERATION,
      {
        id,
      }
    )
  }

  async function cancelOperationInProgress(): Promise<void> {
    let { currentBulkOperation: bulkOperation } = await currentOperation()
    if (!bulkOperation) {
      return
    }

    const cancelTimer = gatsbyApi.reporter.activityTimer(
      `Canceling previous operation: ${bulkOperation.id}`
    )

    cancelTimer.start()

    if (bulkOperation.status === `RUNNING`) {
      cancelTimer.setStatus(
        `Canceling a currently running operation: ${bulkOperation.id}, this could take a few moments`
      )

      const { bulkOperationCancel } = await cancelOperation(bulkOperation.id)

      bulkOperation = bulkOperationCancel.bulkOperation

      while (bulkOperation.status !== `CANCELED`) {
        await new Promise(resolve => setTimeout(resolve, 100))
        const currentOp = await currentOperation()
        bulkOperation = currentOp.currentBulkOperation
        cancelTimer.setStatus(
          `Waiting for operation to cancel: ${bulkOperation.id}, ${bulkOperation.status}`
        )
      }
    } else {
      /**
       * Just because it's not running doesn't mean it's done. For
       * example, it could be CANCELING. We still have to wait for it
       * to be officially finished before we start a new one.
       */
      while (!finishedStatuses.includes(bulkOperation.status)) {
        await new Promise(resolve => setTimeout(resolve, 100))
        bulkOperation = (await currentOperation()).currentBulkOperation
        cancelTimer.setStatus(
          `Waiting for operation to cancel: ${bulkOperation.id}, ${bulkOperation.status}`
        )
      }
    }

    cancelTimer.end()
  }

  /* Maybe the interval should be adjustable, because users
   * with larger data sets could easily wait longer. We could
   * perhaps detect that the interval being used is too small
   * based on returned object counts and iteration counts, and
   * surface feedback to the user suggesting that they increase
   * the interval.
   */
  async function completedOperation(
    operationId: string,
    interval = 1000
  ): Promise<{ node: IBulkOperationNode }> {
    let operation = await graphqlClient.request<{
      node: IBulkOperationNode
    }>(OPERATION_BY_ID, {
      id: operationId,
    })

    const completedTimer = gatsbyApi.reporter.activityTimer(
      `Waiting for bulk operation to complete`
    )

    completedTimer.start()

    let waitForOperation = true

    while (waitForOperation) {
      if (failedStatuses.includes(operation.node.status)) {
        completedTimer.end()
        waitForOperation = false
        throw new OperationError(operation.node)
      }

      if (operation.node.status === `COMPLETED`) {
        completedTimer.end()
        waitForOperation = false
        return operation
      }

      await new Promise(resolve => setTimeout(resolve, interval))

      operation = await graphqlClient.request<{
        node: IBulkOperationNode
      }>(OPERATION_BY_ID, {
        id: operationId,
      })

      completedTimer.setStatus(shiftLeft`
        Polling bulk operation: ${operation.node.id}
        Status: ${operation.node.status}
        Object count: ${operation.node.objectCount}
      `)
    }

    throw new Error(`It should never reach this error`)
  }

  return {
    productsOperation: createOperation(
      new ProductsQuery(pluginOptions).query(lastBuildTime),
      `PRODUCTS`
    ),

    productVariantsOperation: createOperation(
      new ProductVariantsQuery(pluginOptions).query(lastBuildTime),
      `PRODUCT_VARIANTS`
    ),

    ordersOperation: createOperation(
      new OrdersQuery(pluginOptions).query(lastBuildTime),
      `ORDERS`
    ),

    collectionsOperation: createOperation(
      new CollectionsQuery(pluginOptions).query(lastBuildTime),
      `COLLECTIONS`
    ),

    locationsOperation: createOperation(
      new LocationsQuery(pluginOptions).query(lastBuildTime),
      `LOCATIONS`
    ),

    cancelOperationInProgress,
    cancelOperation,
    finishLastOperation,
    completedOperation,
  }
}
