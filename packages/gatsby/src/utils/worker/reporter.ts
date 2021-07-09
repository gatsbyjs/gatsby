import reporter from "gatsby-cli/lib/reporter"
import { ActionCreators } from "gatsby-cli/lib/reporter/types"
import { GatsbyWorkerPool } from "./types"
import { isWorker, getMessenger } from "./messaging"

type ReporterActions = typeof ActionCreators
type ReporterActionKeys = keyof ReporterActions

export function initReporterMessagingInMainProcess(
  workerPool: GatsbyWorkerPool
): void {
  workerPool.onMessage(msg => {
    if (msg.type === `LOG_INTENT`) {
      // @ts-ignore Next line (`...msg.payload.args`) cause "A spread argument
      // must either have a tuple type or be passed to a rest parameter"
      ActionCreators[msg.payload.name].call(ActionCreators, ...msg.payload.args)
    }
  })
}

const gatsbyWorkerMessenger = getMessenger()
export function initReporterMessagingInWorker(): void {
  if (isWorker && gatsbyWorkerMessenger) {
    if (typeof reporter.setReporterActions === `function`) {
      const intentifiedActionCreators = {}
      for (const actionCreatorName of Object.keys(ActionCreators) as Array<
        ReporterActionKeys
      >) {
        // swap each reporter action creator with function that send intent
        // to main process
        intentifiedActionCreators[actionCreatorName] = (...args): void => {
          gatsbyWorkerMessenger.sendMessage({
            type: `LOG_INTENT`,
            payload: {
              name: actionCreatorName,
              args,
            } as any,
          })
        }
      }
      reporter.setReporterActions(intentifiedActionCreators as ReporterActions)
    }

    process.on(`unhandledRejection`, (reason: unknown) => {
      reporter.panic((reason as Error) || `Unhandled rejection`)
    })

    process.on(`uncaughtException`, function (err) {
      reporter.panic(err)
    })
  }
}
