import reporter from "gatsby-cli/lib/reporter"
import { GatsbyWorkerPool } from "./types"
import { isWorker, getMessenger } from "./messaging"

export function initReporterMessagingInMainProcess(
  workerPool: GatsbyWorkerPool
): void {
  if (typeof reporter._initReporterMessagingInMain === `function`) {
    reporter._initReporterMessagingInMain(workerPool.onMessage.bind(workerPool))
  }
}

const gatsbyWorkerMessenger = getMessenger()
export function initReporterMessagingInWorker(): void {
  if (
    isWorker &&
    gatsbyWorkerMessenger &&
    typeof reporter._initReporterMessagingInWorker === `function`
  ) {
    reporter._initReporterMessagingInWorker(
      gatsbyWorkerMessenger.sendMessage.bind(gatsbyWorkerMessenger)
    )

    process.on(`unhandledRejection`, (reason: unknown) => {
      reporter.panic((reason as Error) || `Unhandled rejection`)
    })

    process.on(`uncaughtException`, function (err) {
      reporter.panic(err)
    })
  }
}
