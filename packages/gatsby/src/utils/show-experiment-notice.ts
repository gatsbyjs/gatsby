import { getConfigStore } from "gatsby-core-utils"
import reporter from "gatsby-cli/lib/reporter"
import chalk from "chalk"

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
const configStoreKey = (experimentIdentifier): string =>
  `lastExperimentNotice.${experimentIdentifier}`

export function showExperimentNoticeAfterTimeout(
  experimentIdentifier: string,
  umbrellaLink: string,
  noticeText: string,
  showNoticeAfterMs: number,
  minimumIntervalBetweenNoticesMs: number = ONE_DAY
): CancelExperimentNoticeCallbackOrUndefined {
  const lastTimeWeShowedNotice = getConfigStore().get(
    configStoreKey(experimentIdentifier)
  )

  if (lastTimeWeShowedNotice) {
    if (Date.now() - lastTimeWeShowedNotice < minimumIntervalBetweenNoticesMs) {
      return undefined
    }
  }

  const noticeTimeout = setTimeout(() => {
    noticesToShow.push({ noticeText, umbrellaLink, experimentIdentifier })
  }, showNoticeAfterMs)

  return function clearNoticeTimeout(): void {
    clearTimeout(noticeTimeout)
  }
}

export const createNoticeMessage = (notices): string => {
  let message = `\nHi from the Gatsby maintainers! Based on what we see in your site, these coming
features may help you. All of these can be enabled within gatsby-config.js via
flags (samples below)`

  notices.forEach(
    notice =>
      (message += `

${chalk.bgBlue.bold(notice.experimentIdentifier)} (${notice.umbrellaLink}), ${
        notice.noticeText
      }\n`)
  )

  return message
}

export const showExperimentNotices = (): void => {
  if (noticesToShow.length > 0) {
    // Store that we're showing the invite.
    noticesToShow.forEach(notice =>
      getConfigStore().set(
        configStoreKey(notice.experimentIdentifier),
        Date.now()
      )
    )

    const message = createNoticeMessage(noticesToShow)
    reporter.info(message)
  }
}
