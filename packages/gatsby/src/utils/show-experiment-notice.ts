import { getConfigStore } from "gatsby-core-utils"
import reporter from "gatsby-cli/lib/reporter"
import { emitter } from "../redux"
import chalk from "chalk"
import telemetry from "gatsby-telemetry"

type CancelExperimentNoticeCallback = () => void

export type CancelExperimentNoticeCallbackOrUndefined =
  | CancelExperimentNoticeCallback
  | undefined

const ONE_DAY = 24 * 60 * 60 * 1000

interface INoticeObject {
  reason: string
  solution: string
}

type NoticesToShow = INoticeObject & {
  experimentIdentifier: string
}

const noticesToShow: Array<NoticesToShow> = []

export function showExperimentNoticeAfterTimeout(
  experimentIdentifier: string,
  noticeObject: INoticeObject,
  showNoticeAfterMs: number,
  minimumIntervalBetweenNoticesMs: number = ONE_DAY
): CancelExperimentNoticeCallbackOrUndefined {
  const configStoreKey = `lastExperimentNotice.${experimentIdentifier}`

  const lastTimeWeShowedNotice = getConfigStore().get(configStoreKey)

  if (lastTimeWeShowedNotice) {
    if (Date.now() - lastTimeWeShowedNotice < minimumIntervalBetweenNoticesMs) {
      return undefined
    }
  }

  const noticeTimeout = setTimeout(() => {
    noticesToShow.push({ ...noticeObject, experimentIdentifier })

    getConfigStore().set(configStoreKey, Date.now())
  }, showNoticeAfterMs)

  return function clearNoticeTimeout(): void {
    clearTimeout(noticeTimeout)
  }
}

emitter.on(`COMPILATION_DONE`, () => {
  emitter.off(`COMPILATION_DONE`, () => {})

  if (noticesToShow.length > 0) {
    telemetry.trackFeatureIsUsed(`InviteToTryExperiment`)
    let message = `\n\nHello! Your friendly Gatsby maintainers detected ways to improve your site. We're working on new improvements and invite you to try them out *today* and help ready them for general release.`

    noticesToShow.forEach(
      notice =>
        (message += `\n\n${chalk.bgBlue.bold(
          notice.experimentIdentifier
        )}\n-${notice.reason.trim()}\n-${notice.solution.trim()}\n`)
    )

    reporter.info(message)
  }
})
