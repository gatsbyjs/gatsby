import React, { useEffect, useRef, FC, useContext } from "react"
import IndicatorContext, {
  IndicatorProvider,
} from "../../context/IndicatorContext"
import {
  LinkIndicatorButton,
  InfoIndicatorButton,
  GatsbyIndicatorButton,
} from "../indicatorButtons"
import { BuildStatus, EventType } from "../../models/enums"
import { useBuildInfo, usePageData, useNodeManifestPoll } from "../../hooks"
import { ContentSyncInfo } from "../../models/interfaces"

interface IPageDataChangedResponse {
  changed: boolean
  errorMessage: string | null
}

// constants
const POLLING_INTERVAL = process.env.GATSBY_PREVIEW_POLL_INTERVAL
  ? parseInt(process.env.GATSBY_PREVIEW_POLL_INTERVAL)
  : 2000

const PAGE_DATA_RETRY_LIMIT = 60

const Indicator: FC = () => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const shouldPoll = useRef(false)
  const refreshNeeded = useRef(false)
  const trackedInitialLoad = useRef(false)
  const latestCheckedBuild = useRef<string | null | undefined>(null)

  const {
    contentSyncInfo,
    currentBuildId,
    usingContentSync,
    setCurrentBuildStatus,
    setBuildInfo,
    setContentSyncInfo,
    setManifestInfo,
    trackEvent,
  } = useContext(IndicatorContext)
  const { buildInfo, refetch: refetchBuildInfo } = useBuildInfo()
  const {
    data: pageData,
    errorMessage: pageDataErrorMessage,
    refetch: refetchPageData,
  } = usePageData({
    immediate: false,
  })

  const nodeManifestPollArgs = {
    contentLoaderInfo: {
      orgId: buildInfo?.siteInfo?.orgId,
      previewBuildStatus: buildInfo?.currentBuild?.buildStatus,
      previewUrl:
        // for local dev / debugging
        process.env.GATSBY_PREVIEW_URL ||
        // for production
        window.location.origin,
    },
    manifestId: contentSyncInfo?.manifestId || ``,
    sourcePluginName: contentSyncInfo?.pluginName || ``,
    siteId: buildInfo?.siteInfo?.siteId || ``,
    shouldPoll: !!usingContentSync,
  }

  const {
    redirectUrl: nodeManifestRedirectUrl,
    errorMessage: nodeManifestErrorMessage,
  } = useNodeManifestPoll(nodeManifestPollArgs)

  // methods
  const getContentSyncInfoFromURL = (): ContentSyncInfo | null => {
    const urlSearchParams = new URLSearchParams(window.location.search)

    // manifestId and pluginName are shortened to keep the url concise
    const buf = Buffer.from(urlSearchParams.get(`csync`) || ``) || `{}`
    const { mid: manifestId, plgn: pluginName } = JSON.parse(
      buf.toString(`base64`)
    )

    if (!manifestId || !pluginName) {
      return null
    }
    return { manifestId, pluginName }
  }

  const hasPageDataChanged = async (): Promise<IPageDataChangedResponse> => {
    if (currentBuildId !== latestCheckedBuild.current) {
      let counter = 0
      let changed = false

      while (!changed && counter <= PAGE_DATA_RETRY_LIMIT) {
        const loadedPageData = pageData
        await refetchPageData()

        if (pageDataErrorMessage) {
          return { changed: false, errorMessage: pageDataErrorMessage }
        }

        counter++
        changed = loadedPageData !== pageData

        if (!changed) {
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL))
        }
      }

      latestCheckedBuild.current = currentBuildId
      return { changed, errorMessage: null }
    }
    return { changed: false, errorMessage: null }
  }

  const pollData = async (): Promise<void> => {
    // currentBuild is the most recent build that is not QUEUED.
    // latestBuild is the most recent build that finished running (ONLY status ERROR or SUCCESS)
    const oldBuildId = currentBuildId
    await refetchBuildInfo()

    if (buildInfo?.latestBuild && buildInfo.currentBuild) {
      const { currentBuild, latestBuild } = buildInfo
      if (
        [
          BuildStatus.BUILDING,
          BuildStatus.ERROR,
          BuildStatus.QUEUED,
          BuildStatus.UPLOADING,
        ].includes(currentBuild.buildStatus)
      ) {
        setCurrentBuildStatus(currentBuild.buildStatus)
      } else if (oldBuildId) {
        if (oldBuildId === currentBuild.id) {
          setCurrentBuildStatus(BuildStatus.UP_TO_DATE)
        } else if (
          oldBuildId !== latestBuild.id &&
          currentBuild.buildStatus === BuildStatus.SUCCESS
        ) {
          if (refreshNeeded.current) {
            setCurrentBuildStatus(BuildStatus.SUCCESS)
          } else if (!usingContentSync) {
            const { changed: pageDataChanged, errorMessage } =
              await hasPageDataChanged()

            if (errorMessage) {
              setBuildInfo({ ...buildInfo, errorMessage })
              setCurrentBuildStatus(BuildStatus.ERROR)
            } else if (pageDataChanged) {
              // Force a "This page has updated message" until a page is refreshed
              refreshNeeded.current = true
              // Build updated, data for this specific page has changed!
              setCurrentBuildStatus(BuildStatus.SUCCESS)
            } else {
              // Build updated, data for this specific page has NOT changed, no need to refresh content.
              setCurrentBuildStatus(BuildStatus.UP_TO_DATE)
            }
          }
        }
      }
    }

    if (shouldPoll.current) {
      timeoutRef.current = setTimeout(pollData, POLLING_INTERVAL)
    }
  }

  // effect hooks
  useEffect(() => {
    const contentSyncInfoFromURL = getContentSyncInfoFromURL()
    if (contentSyncInfoFromURL) {
      setContentSyncInfo(contentSyncInfoFromURL)
    } else {
      refetchPageData()
    }

    shouldPoll.current = true
    pollData()

    return function cleanup(): void {
      shouldPoll.current = false

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    setBuildInfo(buildInfo)
    if (
      buildInfo?.siteInfo &&
      buildInfo?.latestBuild &&
      !trackedInitialLoad.current
    ) {
      const { orgId, siteId } = buildInfo.siteInfo
      trackEvent({
        eventType: EventType.PREVIEW_INDICATOR_LOADED,
        buildId: currentBuildId || buildInfo.latestBuild.id,
        orgId,
        siteId,
        name: `indicator loaded`,
      })

      trackedInitialLoad.current = true
    }
  }, [buildInfo])

  useEffect(() => {
    if (nodeManifestErrorMessage) {
      setManifestInfo({ errorMessage: nodeManifestErrorMessage })
      console.error(nodeManifestErrorMessage)
    } else if (nodeManifestRedirectUrl) {
      setManifestInfo({ redirectUrl: nodeManifestRedirectUrl })
      // Force a "This page has updated message" until the page is refreshed
      refreshNeeded.current = true
    }
  }, [nodeManifestRedirectUrl, nodeManifestErrorMessage])

  return (
    <div>
      <IndicatorProvider>
        <InfoIndicatorButton {...buttonProps} />
        <GatsbyIndicatorButton />,
        <LinkIndicatorButton {...buttonProps} />,
      </IndicatorProvider>
    </div>
  )
}

export default Indicator
