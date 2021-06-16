import fetch from "node-fetch"
import { SourceNodesArgs } from "gatsby"
import { createInterface } from "readline"
import { shiftLeft } from "shift-left"

import { nodeBuilder } from "./node-builder"
import { IShopifyBulkOperation } from "./operations"
import {
  OperationError,
  HttpError,
  pluginErrorCodes as errorCodes,
} from "./errors"

export function makeSourceFromOperation(
  finishLastOperation: () => Promise<void>,
  completedOperation: (id: string) => Promise<{ node: BulkOperationNode }>,
  cancelOperationInProgress: () => Promise<void>,
  gatsbyApi: SourceNodesArgs,
  pluginOptions: ShopifyPluginOptions
) {
  return async function sourceFromOperation(
    op: IShopifyBulkOperation,
    isPriorityBuild = process.env.IS_PRODUCTION_BRANCH === `true`
  ): Promise<void> {
    const { reporter, actions } = gatsbyApi

    const operationTimer = reporter.activityTimer(
      `Source from bulk operation ${op.name}`
    )

    operationTimer.start()

    try {
      if (isPriorityBuild) {
        await cancelOperationInProgress()
      } else {
        await finishLastOperation()
      }

      reporter.info(`Initiating bulk operation query ${op.name}`)
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
      reporter.info(`Completed bulk operation ${op.name}: ${bulkOperation.id}`)

      if (parseInt(resp.node.objectCount, 10) === 0) {
        reporter.info(`No data was returned for this operation`)
        operationTimer.end()
        return
      }

      operationTimer.setStatus(
        `Fetching ${resp.node.objectCount} results for ${op.name}: ${bulkOperation.id}`
      )

      const results = await fetch(resp.node.url)

      operationTimer.setStatus(
        `Processing ${resp.node.objectCount} results for ${op.name}: ${bulkOperation.id}`
      )
      const rl = createInterface({
        input: results.body,
        crlfDelay: Infinity,
      })

      reporter.info(`Creating nodes from bulk operation ${op.name}`)

      const objects: BulkResults = []

      for await (const line of rl) {
        objects.push(JSON.parse(line))
      }

      await Promise.all(
        op
          .process(
            objects,
            nodeBuilder(gatsbyApi, pluginOptions),
            gatsbyApi,
            pluginOptions
          )
          .map(async promise => {
            const node = await promise
            actions.createNode(node)
          })
      )

      operationTimer.end()
    } catch (e) {
      if (e instanceof OperationError) {
        const code = errorCodes.bulkOperationFailed

        if (e.node.status === `CANCELED`) {
          if (isPriorityBuild) {
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

      reporter.panic({
        id: errorCodes.unknownSourcingFailure,
        context: {
          sourceMessage: `Could not source from bulk operation`,
        },
        error: e,
      })
    }
  }
}
