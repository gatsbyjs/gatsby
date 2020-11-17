import { getConfigStore } from "gatsby-core-utils"
import reporter from "gatsby-cli/lib/reporter"

type CancelExperimentNoticeCallback = () => void

export type CancelExperimentNoticeCallbackOrUndefined =
  | CancelExperimentNoticeCallback
  | undefined

const ONE_DAY = 24 * 60 * 60 * 1000

export function showExperimentNoticeAfterTimeout(
  experimentIdentifier: string,
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
    reporter.info(noticeText)

    getConfigStore().set(configStoreKey, Date.now())
  }, showNoticeAfterMs)

  return function clearNoticeTimeout(): void {
    clearTimeout(noticeTimeout)
  }
}
