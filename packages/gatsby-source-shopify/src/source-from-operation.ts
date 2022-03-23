import fetch from "node-fetch"
import { SourceNodesArgs } from "gatsby"
import { createInterface } from "readline"
import { shiftLeft } from "shift-left"

import { isPriorityBuild } from "./helpers"
import { processBulkResults } from "./process-bulk-results"
import {
  OperationError,
  HttpError,
  pluginErrorCodes as errorCodes,
} from "./errors"

export function makeSourceFromOperation(
  finishLastOperation: () => Promise<void>,
  completedOperation: (id: string) => Promise<{ node: IBulkOperationNode }>,
  cancelOperationInProgress: () => Promise<void>,
  gatsbyApi: SourceNodesArgs,
  pluginOptions: IShopifyPluginOptions,
  lastBuildTime?: Date
) {
  return async function sourceFromOperation(
    op: IShopifyBulkOperation
  ): Promise<void> {
    const { reporter } = gatsbyApi

    const operationTimer = reporter.activityTimer(
      `source ${lastBuildTime ? `changed ` : ``}shopify ${op.name}`
    )

    operationTimer.start()

    try {
      if (isPriorityBuild(pluginOptions)) {
        await cancelOperationInProgress()
      } else {
        await finishLastOperation()
      }

      const {
        bulkOperationRunQuery: { userErrors, bulkOperation },
      } = await op.execute()

      if (userErrors.length) {
        reporter.panic(
          userErrors.map(e => {
            const msg = e.field
              ? `${e.field.join(`.`)}: ${e.message}`
              : e.message

            return {
              id: errorCodes.bulkOperationFailed,
              context: {
                sourceMessage: `Couldn't initiate bulk operation query`,
              },
              error: new Error(msg),
            }
          })
        )
      }

      const resp = await completedOperation(bulkOperation.id)

      if (parseInt(resp.node.objectCount, 10) === 0) {
        operationTimer.end()
        return
      }

      const { body: jsonLines } = await fetch(resp.node.url)

      const rl = createInterface({
        input: jsonLines,
        crlfDelay: Infinity,
      })

      const results: BulkResults = []

      for await (const line of rl) {
        results.push(JSON.parse(line))
      }

      const nodeCount = await processBulkResults(
        gatsbyApi,
        pluginOptions,
        results
      )

      operationTimer.setStatus(`${nodeCount} nodes`)

      operationTimer.end()
    } catch (e) {
      if (e instanceof OperationError) {
        const code = errorCodes.bulkOperationFailed

        if (e.node.status === `CANCELED`) {
          if (isPriorityBuild(pluginOptions)) {
            /**
             * There are at least two production sites for this Shopify
             * store trying to run an operation at the same time.
             */
            reporter.panic({
              id: errorCodes.apiConflict,
              error: e,
              context: {},
            })
          } else {
            // A prod build canceled me, wait and try again
            operationTimer.setStatus(
              `This operation has been canceled by a higher priority build. It will retry shortly.`
            )
            operationTimer.end()
            await new Promise(resolve => setTimeout(resolve, 5000))
            await sourceFromOperation(op)
          }
        }

        if (e.node.errorCode === `ACCESS_DENIED`) {
          reporter.panic({
            id: code,
            context: {
              sourceMessage: `Your credentials don't have access to a resource you requested`,
            },
            error: e,
          })
        }

        reporter.panic({
          id: errorCodes.unknownSourcingFailure,
          context: {
            sourceMessage: shiftLeft`
              Operation ${op.name} failed after ${e.node.objectCount} objects
              - With status: ${e.node.status} - error code: ${e.node.errorCode}
            `,
          },
          error: e,
        })
      }

      if (e instanceof HttpError) {
        reporter.panic({
          id: errorCodes.unknownApiError,
          context: {
            sourceMessage: `Received error ${
              e.response.status
            } from Shopify: ${await e.response.text()}`,
          },
          error: e,
        })
      }

      console.log(e)

      reporter.panic({
        id: errorCodes.unknownSourcingFailure,
        context: {
          sourceMessage: `Could not source from bulk operation`,
        },
        error: e as Error,
      })
    }
  }
}
