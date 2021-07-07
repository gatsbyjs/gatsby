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
      const intentifiedActionCreators = (Object.keys(ActionCreators) as Array<
        ReporterActionKeys
      >).reduce((acc, keyName: ReporterActionKeys) => {
        acc[keyName] = (
          ...args: Parameters<ReporterActions[ReporterActionKeys]>
        ): void => {
          gatsbyWorkerMessenger.sendMessage({
            type: `LOG_INTENT`,
            payload: {
              name: keyName,
              args,
            } as any,
          })
        }
        return acc
      }, {}) as ReporterActions

      reporter.setReporterActions(intentifiedActionCreators)
    }

    process.on(`unhandledRejection`, (reason: unknown) => {
      reporter.panic((reason as Error) || `Unhandled rejection`)
    })

    process.on(`uncaughtException`, function (err) {
      reporter.panic(err)
    })
  }
}
