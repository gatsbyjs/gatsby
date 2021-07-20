import { NodeInput, SourceNodesArgs } from "gatsby"
import { shiftLeft } from "shift-left"
import { createClient } from "./client"
import { ProductsQuery } from "./query-builders/products-query"
import { ProductVariantsQuery } from "./query-builders/product-variants-query"
import { CollectionsQuery } from "./query-builders/collections-query"
import { OrdersQuery } from "./query-builders/orders-query"
import { LocationsQuery } from "./query-builders/locations-query"
import {
  collectionsProcessor,
  incrementalProductsProcessor,
  productVariantsProcessor,
} from "./processors"
import { OperationError } from "./errors"

import {
  OPERATION_STATUS_QUERY,
  OPERATION_BY_ID,
  CANCEL_OPERATION,
} from "./static-queries"

export interface IShopifyBulkOperation {
  execute: () => Promise<BulkOperationRunQueryResponse>
  name: string
  process: (
    objects: BulkResults,
    nodeBuilder: NodeBuilder,
    _gatsbyApi: SourceNodesArgs,
    _pluginOptions: ShopifyPluginOptions
  ) => Array<Promise<NodeInput>>
}

interface IOperations {
  incrementalProducts: (date: Date) => IShopifyBulkOperation
  incrementalProductVariants: (date: Date) => IShopifyBulkOperation
  incrementalOrders: (date: Date) => IShopifyBulkOperation
  incrementalCollections: (date: Date) => IShopifyBulkOperation
  incrementalLocations: (date: Date) => IShopifyBulkOperation
  createProductsOperation: IShopifyBulkOperation
  createProductVariantsOperation: IShopifyBulkOperation
  createOrdersOperation: IShopifyBulkOperation
  createCollectionsOperation: IShopifyBulkOperation
  createLocationsOperation: IShopifyBulkOperation
  cancelOperationInProgress: () => Promise<void>
  cancelOperation: (id: string) => Promise<BulkOperationCancelResponse>
  finishLastOperation: () => Promise<void>
  completedOperation: (
    operationId: string,
    interval?: number
  ) => Promise<{ node: BulkOperationNode }>
}

const finishedStatuses = [`COMPLETED`, `FAILED`, `CANCELED`, `EXPIRED`]
const failedStatuses = [`FAILED`, `CANCELED`]

function defaultProcessor(
  objects: BulkResults,
  builder: NodeBuilder
): Array<Promise<NodeInput>> {
  return objects.map(builder.buildNode)
}

export function createOperations(
  options: ShopifyPluginOptions,
  { reporter }: SourceNodesArgs
): IOperations {
  const client = createClient(options)

  function currentOperation(): Promise<CurrentBulkOperationResponse> {
    return client.request(OPERATION_STATUS_QUERY)
  }

  function createOperation(
    operationQuery: string,
    name: string,
    process?: IShopifyBulkOperation["process"]
  ): IShopifyBulkOperation {
    return {
      execute: (): Promise<BulkOperationRunQueryResponse> =>
        client.request<BulkOperationRunQueryResponse>(operationQuery),
      name,
      process: process || defaultProcessor,
    }
  }

  async function finishLastOperation(): Promise<void> {
    let { currentBulkOperation } = await currentOperation()
    if (currentBulkOperation && currentBulkOperation.id) {
      const timer = reporter.activityTimer(
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
  ): Promise<BulkOperationCancelResponse> {
    return client.request<BulkOperationCancelResponse>(CANCEL_OPERATION, {
      id,
    })
  }

  async function cancelOperationInProgress(): Promise<void> {
    let { currentBulkOperation: bulkOperation } = await currentOperation()
    if (!bulkOperation) {
      return
    }

    const cancelTimer = reporter.activityTimer(
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
  ): Promise<{ node: BulkOperationNode }> {
    let operation = await client.request<{
      node: BulkOperationNode
    }>(OPERATION_BY_ID, {
      id: operationId,
    })

    const completedTimer = reporter.activityTimer(
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

      operation = await client.request<{
        node: BulkOperationNode
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
    incrementalProducts(date: Date): IShopifyBulkOperation {
      return createOperation(
        new ProductsQuery(options).query(date),
        `INCREMENTAL_PRODUCTS`,
        incrementalProductsProcessor
      )
    },

    incrementalProductVariants(date: Date): IShopifyBulkOperation {
      return createOperation(
        new ProductVariantsQuery(options).query(date),
        `INCREMENTAL_PRODUCT_VARIANTS`,
        productVariantsProcessor
      )
    },

    incrementalOrders(date: Date): IShopifyBulkOperation {
      return createOperation(
        new OrdersQuery(options).query(date),
        `INCREMENTAL_ORDERS`
      )
    },

    incrementalCollections(date: Date): IShopifyBulkOperation {
      return createOperation(
        new CollectionsQuery(options).query(date),
        `INCREMENTAL_COLLECTIONS`,
        collectionsProcessor
      )
    },

    incrementalLocations(date: Date): IShopifyBulkOperation {
      return createOperation(
        new CollectionsQuery(options).query(date),
        `INCREMENTAL_LOCATIONS`
      )
    },

    createProductsOperation: createOperation(
      new ProductsQuery(options).query(),
      `PRODUCTS`
    ),

    createProductVariantsOperation: createOperation(
      new ProductVariantsQuery(options).query(),
      `PRODUCT_VARIANTS`,
      productVariantsProcessor
    ),

    createOrdersOperation: createOperation(
      new OrdersQuery(options).query(),
      `ORDERS`
    ),

    createCollectionsOperation: createOperation(
      new CollectionsQuery(options).query(),
      `COLLECTIONS`,
      collectionsProcessor
    ),

    createLocationsOperation: createOperation(
      new LocationsQuery(options).query(),
      `LOCATIONS`
    ),

    cancelOperationInProgress,
    cancelOperation,
    finishLastOperation,
    completedOperation,
  }
}
