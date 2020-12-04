import { getConfigStore } from "gatsby-core-utils"
import reporter from "gatsby-cli/lib/reporter"
import { emitter } from "../redux"
import chalk from "chalk"
import telemetry from "gatsby-telemetry"
import realTerminalLink from "terminal-link"

const terminalLink = (text, url): string => {
  if (process.env.NODE_ENV === `test`) {
    return `${text} (${url})`
  } else {
    return realTerminalLink(text, url)
  }
}

type CancelExperimentNoticeCallback = () => void

export type CancelExperimentNoticeCallbackOrUndefined =
  | CancelExperimentNoticeCallback
  | undefined

const ONE_DAY = 24 * 60 * 60 * 1000

interface INoticeObject {
  noticeText: string
  umbrellaLink: string
  experimentIdentifier: string
}

const noticesToShow: Array<INoticeObject> = []

export function showExperimentNoticeAfterTimeout(
  experimentIdentifier: string,
  umbrellaLink: string,
  noticeText: string,
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
    noticesToShow.push({ noticeText, umbrellaLink, experimentIdentifier })

    getConfigStore().set(configStoreKey, Date.now())
  }, showNoticeAfterMs)

  return function clearNoticeTimeout(): void {
    clearTimeout(noticeTimeout)
  }
}

export const createNoticeMessage = (notices): string => {
  let message = `\n
Hi from the Gatsby maintainers! Based on what we see in your site, these coming
features may help you. All of these can be enabled within gatsby-config.js via
flags (samples below)`

  notices.forEach(
    notice =>
      (message += `\n\n${chalk.bgBlue.bold(
        terminalLink(notice.experimentIdentifier, notice.umbrellaLink)
      )}, ${notice.noticeText}\n`)
  )

  return message
}

const showNotices = (): void => {
  emitter.off(`COMPILATION_DONE`, showNotices)
  if (noticesToShow.length > 0) {
    telemetry.trackFeatureIsUsed(`InviteToTryExperiment`)
    const message = createNoticeMessage(noticesToShow)
    reporter.info(message)
  }
}

emitter.on(`COMPILATION_DONE`, showNotices)
