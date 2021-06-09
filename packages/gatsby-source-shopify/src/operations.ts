import { NodeInput, SourceNodesArgs } from "gatsby";
import { shiftLeft } from "shift-left";
import { createClient } from "./client";
import { ProductsQuery } from "./query-builders/products-query";
import { CollectionsQuery } from "./query-builders/collections-query";
import { OrdersQuery } from "./query-builders/orders-query";
import {
  collectionsProcessor,
  incrementalProductsProcessor,
} from "./processors";
import { OperationError } from "./errors";

import {
  OPERATION_STATUS_QUERY,
  OPERATION_BY_ID,
  CANCEL_OPERATION,
} from "./static-queries";

export interface ShopifyBulkOperation {
  execute: () => Promise<BulkOperationRunQueryResponse>;
  name: string;
  process: (
    objects: BulkResults,
    nodeBuilder: NodeBuilder,
    gatsbyApi: SourceNodesArgs,
    pluginOptions: ShopifyPluginOptions
  ) => Promise<NodeInput>[];
}

const finishedStatuses = [`COMPLETED`, `FAILED`, `CANCELED`, `EXPIRED`];
const failedStatuses = [`FAILED`, `CANCELED`];

function defaultProcessor(objects: BulkResults, builder: NodeBuilder) {
  return objects.map(builder.buildNode);
}

export function createOperations(
  options: ShopifyPluginOptions,
  { reporter }: SourceNodesArgs
) {
  const client = createClient(options);

  function currentOperation(): Promise<CurrentBulkOperationResponse> {
    return client.request(OPERATION_STATUS_QUERY);
  }

  function createOperation(
    operationQuery: string,
    name: string,
    process?: ShopifyBulkOperation["process"]
  ): ShopifyBulkOperation {
    return {
      execute: () =>
        client.request<BulkOperationRunQueryResponse>(operationQuery),
      name,
      process: process || defaultProcessor,
    };
  }

  async function finishLastOperation(): Promise<void> {
    let { currentBulkOperation } = await currentOperation();
    if (currentBulkOperation && currentBulkOperation.id) {
      const timer = reporter.activityTimer(
        `Waiting for operation ${currentBulkOperation.id} : ${currentBulkOperation.status}`
      );
      timer.start();

      while (!finishedStatuses.includes(currentBulkOperation.status)) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        currentBulkOperation = (await currentOperation()).currentBulkOperation;
        timer.setStatus(
          `Polling operation ${currentBulkOperation.id} : ${currentBulkOperation.status}`
        );
      }

      timer.end();
    }
  }

  async function cancelOperation(id: string) {
    return client.request<BulkOperationCancelResponse>(CANCEL_OPERATION, {
      id,
    });
  }

  async function cancelOperationInProgress(): Promise<void> {
    let { currentBulkOperation: bulkOperation } = await currentOperation();
    if (!bulkOperation) {
      return;
    }

    const cancelTimer = reporter.activityTimer(
      `Canceling previous operation: ${bulkOperation.id}`
    );

    cancelTimer.start();

    if (bulkOperation.status === `RUNNING`) {
      cancelTimer.setStatus(
        `Canceling a currently running operation: ${bulkOperation.id}, this could take a few moments`
      );

      const { bulkOperationCancel } = await cancelOperation(bulkOperation.id);

      bulkOperation = bulkOperationCancel.bulkOperation;

      while (bulkOperation.status !== `CANCELED`) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        const currentOp = await currentOperation();
        bulkOperation = currentOp.currentBulkOperation;
        cancelTimer.setStatus(
          `Waiting for operation to cancel: ${bulkOperation.id}, ${bulkOperation.status}`
        );
      }
    } else {
      /**
       * Just because it's not running doesn't mean it's done. For
       * example, it could be CANCELING. We still have to wait for it
       * to be officially finished before we start a new one.
       */
      while (!finishedStatuses.includes(bulkOperation.status)) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        bulkOperation = (await currentOperation()).currentBulkOperation;
        cancelTimer.setStatus(
          `Waiting for operation to cancel: ${bulkOperation.id}, ${bulkOperation.status}`
        );
      }
    }

    cancelTimer.end();
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
      node: BulkOperationNode;
    }>(OPERATION_BY_ID, {
      id: operationId,
    });

    const completedTimer = reporter.activityTimer(
      `Waiting for bulk operation to complete`
    );

    completedTimer.start();

    while (true) {
      if (failedStatuses.includes(operation.node.status)) {
        completedTimer.end();
        throw new OperationError(operation.node);
      }

      if (operation.node.status === "COMPLETED") {
        completedTimer.end();
        return operation;
      }

      await new Promise((resolve) => setTimeout(resolve, interval));

      operation = await client.request<{
        node: BulkOperationNode;
      }>(OPERATION_BY_ID, {
        id: operationId,
      });

      completedTimer.setStatus(shiftLeft`
        Polling bulk operation: ${operation.node.id}
        Status: ${operation.node.status}
        Object count: ${operation.node.objectCount}
      `);
    }
  }

  return {
    incrementalProducts(date: Date) {
      return createOperation(
        new ProductsQuery(options).query(date),
        "INCREMENTAL_PRODUCTS",
        incrementalProductsProcessor
      );
    },

    incrementalOrders(date: Date) {
      return createOperation(
        new OrdersQuery(options).query(date),
        "INCREMENTAL_ORDERS"
      );
    },

    incrementalCollections(date: Date) {
      return createOperation(
        new CollectionsQuery(options).query(date),
        "INCREMENTAL_COLLECTIONS",
        collectionsProcessor
      );
    },

    createProductsOperation: createOperation(
      new ProductsQuery(options).query(),
      "PRODUCTS"
    ),

    createOrdersOperation: createOperation(
      new OrdersQuery(options).query(),
      "ORDERS"
    ),

    createCollectionsOperation: createOperation(
      new CollectionsQuery(options).query(),
      "COLLECTIONS",
      collectionsProcessor
    ),

    cancelOperationInProgress,
    cancelOperation,
    finishLastOperation,
    completedOperation,
  };
}
