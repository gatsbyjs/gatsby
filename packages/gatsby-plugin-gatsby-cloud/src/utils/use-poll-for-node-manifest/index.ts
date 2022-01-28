import { useEffect, useState } from "react"

import { IContentLoaderInfo, IPollArguments } from "./types"
import { fetchNodeManifest } from "./utils"
import { DEBUG_CONTENT_SYNC_MODE } from "./constants"

export const errorMessages = {
  default: `We've run into an error previewing your site.`,
  noPageFound: `Your Gatsby site didn't create a page for the content you're trying to view.`,
}

const betweenPollWaitTimeMs = 1000
const minutesUntilNodeManifestTimeout = 0.5

/**
 * The polling fn for the ContentLoader component to poll for node manifest files for the users Gatsby site
 */
export const poll = async (pollArgs: IPollArguments): Promise<void> => {
  const {
    shouldPoll: shouldPollInput,
    showError,
    manifestId,
    sourcePluginName,
    pollCount,
    contentLoaderInfo,
    siteId,
    pollCallback,
    frontendUrl,
    waitThenTriggerNextPoll,
    setErrorMessage,
    setShowError,
    setRedirectUrl,
    setLoadingDuration,
  } = pollArgs

  // if any of these are true we won't continue polling in this invocation of poll()
  if (!shouldPollInput || showError) {
    return
  }

  if (manifestId && sourcePluginName && frontendUrl) {
    if (DEBUG_CONTENT_SYNC_MODE) {
      console.info(
        `#${pollCount} poll for manifest at ${contentLoaderInfo?.previewUrl}/__node-manifests/${sourcePluginName}/${manifestId}.json`
      )
    }

    try {
      const { shouldPoll, error, manifest, redirectUrl, loadingDuration } =
        await fetchNodeManifest({
          manifestId,
          siteId,
          sourcePluginName,
          pollCallback,
          frontendUrl,
          setShowError,
        })

      if (shouldPoll) {
        waitThenTriggerNextPoll()
        return
      }

      if (manifest?.foundPageBy === `none`) {
        if (DEBUG_CONTENT_SYNC_MODE) {
          console.info(
            `Gatsby site didn't create a page for the node that's being loaded.`
          )
        }

        setErrorMessage(errorMessages.noPageFound)
        setShowError(true)
        return
      }

      const is404 =
        error?.message?.includes(`invalid json response body`) ||
        (typeof error !== `undefined` && `code` in error && error?.code === 404)

      // 404's may just mean that the build hasn't finished.
      if (is404) {
        if (typeof pollCallback === `function`) {
          pollCallback()
        }

        waitThenTriggerNextPoll()

        if (DEBUG_CONTENT_SYNC_MODE) {
          console.info(
            `Manifest request 404'd (might not be available yet, rechecking).`
          )
        }
      } else if (error) {
        console.error(`Manifest request errored.`, error)

        if (`passwordProtected` in error && error.passwordProtected) {
          setErrorMessage(
            `Content Sync does not currently work with password protected Previews.`
          )
        }

        setShowError(true)
      }

      if (redirectUrl) {
        setRedirectUrl(redirectUrl)
      }

      if (loadingDuration) {
        setLoadingDuration(loadingDuration)
      }
    } catch (error) {
      console.error(`Manifest Gatsby function request errored.`, error)

      setShowError(true)
    }
  }
}

/**
 * Returns a function which when called handles node manifest polling timeouts if builds go idle for too long
 */
const useHandlePollingTimeout = ({
  contentLoaderInfo,
  setShowError,
}: {
  contentLoaderInfo: IContentLoaderInfo | undefined
  setShowError: (arg: boolean) => void
}): { handlePollingTimeout: () => boolean } => {
  const [idleSince, setIdleSince] = useState<number | null>(null)
  const [lastPollBuildStatus, setLastPollBuildStatus] = useState<string | null>(
    null
  )

  const statusHas = (state: string): boolean =>
    !!contentLoaderInfo?.previewBuildStatus?.includes(state)

  /**
   * handlePollingTimeout Handles updating timeout state and returns
   * true/false for whether or not the ui should timeout.
   */
  const handlePollingTimeout = (): boolean => {
    // first check if we should timeout
    if (typeof idleSince === `number`) {
      const minutesSinceIdle = (Date.now() - idleSince) / 1000 / 60
      const shouldTimeout = minutesSinceIdle >= minutesUntilNodeManifestTimeout

      if (shouldTimeout) {
        console.warn(
          `Timed out waiting for node manifest. Builds are idle and no manifest was found after ${minutesSinceIdle} minutes.`
        )
        // make sure that the process times out before showing any errors
        setShowError(true)
        return true
      }
    }

    const buildsAreCurrentlyIdle = statusHas(`ERROR`) || statusHas(`SUCCESS`)

    // check if we're idle and store the current timestamp if we are
    if (
      // if a build status exists
      contentLoaderInfo?.previewBuildStatus &&
      // and it's different than the last build status we stored
      lastPollBuildStatus !== contentLoaderInfo.previewBuildStatus &&
      // and builds are idle
      buildsAreCurrentlyIdle
    ) {
      // store the time we started idling.
      const idleTimestamp = Date.now()

      if (DEBUG_CONTENT_SYNC_MODE) {
        console.info(
          `Setting idle time to now ${idleTimestamp} and last build status to ${contentLoaderInfo.previewBuildStatus}`
        )
      }

      setLastPollBuildStatus(contentLoaderInfo.previewBuildStatus)
      setIdleSince(idleTimestamp)
    }
    // otherwise if we're not idle nullify the idleSince state so we don't timeout if we previously stored an idle start time timestamp
    else if (!buildsAreCurrentlyIdle) {
      if (DEBUG_CONTENT_SYNC_MODE) {
        console.info({
          buildStatus: contentLoaderInfo?.previewBuildStatus,
        })
      }

      setIdleSince(null)
    }

    return false
  }

  return {
    handlePollingTimeout,
  }
}

/**
 * This hook polls for node manifest files and handles polling timeouts when the build queue has gone idle for too long with no manifest file being found.
 */
export const usePollForNodeManifest = ({
  contentLoaderInfo,
  shouldPoll,
  manifestId,
  sourcePluginName,
  siteId,
  pollCallback,
}: {
  contentLoaderInfo: IContentLoaderInfo | undefined
  shouldPoll: boolean
  manifestId: string
  sourcePluginName: string
  siteId: string
  pollCallback?: () => void
}): {
  redirectUrl?: string
  loadingDuration: number
  errorMessage: string | null
} => {
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState(errorMessages.default)
  const [pollCount, setPollCount] = useState(0)

  const { handlePollingTimeout } = useHandlePollingTimeout({
    contentLoaderInfo,
    setShowError,
  })

  const [redirectUrl, setRedirectUrl] = useState<string | undefined>(undefined)
  const [loadingDuration, setLoadingDuration] = useState<number>(0)

  const triggerNextPoll = (): void => setPollCount(pollCount + 1)
  const waitThenTriggerNextPoll = (): void => {
    setTimeout(triggerNextPoll, betweenPollWaitTimeMs)
  }

  // only polling above 0 allows us to manually start polling.
  // The first useEffect run of poll will have pollCount set to 0.
  // Calling triggerNextPoll will increment it to 1 and then pollingHasStarted will be true.
  const pollingHasStarted = pollCount > 0

  const frontendUrl = contentLoaderInfo?.previewUrl || false

  useEffect(
    function handlePoll() {
      if (!pollingHasStarted || !shouldPoll) {
        return
      }

      const shouldTimeout = handlePollingTimeout()

      if (!showError && !shouldTimeout) {
        poll({
          pollCount,
          shouldPoll,
          showError,
          manifestId,
          sourcePluginName,
          contentLoaderInfo,
          siteId,
          pollCallback,
          frontendUrl,
          waitThenTriggerNextPoll,
          setErrorMessage,
          setShowError,
          setRedirectUrl,
          setLoadingDuration,
        })
      }
    },
    // whenever pollCount changes or if we enable shouldPoll we re-run poll()
    [pollCount, shouldPoll]
  )

  useEffect(
    function startPolling() {
      /**
       * When we first receive data from apollo we start polling
       */
      if (!pollingHasStarted && contentLoaderInfo) {
        if (DEBUG_CONTENT_SYNC_MODE) {
          console.info(`Starting to poll for preview build updates`)
        }

        triggerNextPoll()
      }
    },
    [contentLoaderInfo]
  )

  return {
    redirectUrl,
    loadingDuration,
    errorMessage: showError ? errorMessage : null,
  }
}
