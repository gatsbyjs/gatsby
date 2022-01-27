import React, { useState, useEffect, useCallback, useRef } from "react"
import IndicatorProvider from "../context/indicatorProvider"
import { BuildStatus } from "../models/enums"
import { useTrackEvent, getBuildInfo } from "../utils"
import {
  LinkIndicatorButton,
  InfoIndicatorButton,
  GatsbyIndicatorButton,
} from "./buttons"
import Style from "./Style"

import { usePollForNodeManifest } from "../utils/use-poll-for-node-manifest"

const POLLING_INTERVAL = process.env.GATSBY_PREVIEW_POLL_INTERVAL
  ? parseInt(process.env.GATSBY_PREVIEW_POLL_INTERVAL)
  : 2000

const PAGE_DATA_RETRY_LIMIT = 60

const PreviewIndicator = ({ children }) => (
  <>
    <Style />
    <div
      data-testid="preview-status-indicator"
      data-gatsby-preview-indicator="root"
      aria-live="assertive"
    >
      {children}
    </div>
  </>
)

const getContentSyncInfoFromURL = () => {
  const urlSearchParams = new URLSearchParams(window.location.search)
  const { mid: manifestId, plgn: pluginName } = JSON.parse(
    atob(urlSearchParams.get(`csync`) || ``) || `{}`
  )

  if (!manifestId || !pluginName) {
    return null
  }

  return { manifestId, pluginName }
}

let buildId = ``
let pageData
let latestCheckedBuild
let refreshNeeded = false

const Indicator = () => {
  const [buildInfo, setBuildInfo] = useState()
  const [contentSyncInfo, setContentSyncInfo] = useState(null)
  const usingContentSync = !!contentSyncInfo

  const timeoutRef = useRef(null)
  const shouldPoll = useRef(false)
  const trackedInitialLoad = useRef(false)
  const { track } = useTrackEvent()

  async function fetchPageData() {
    const urlHostString = window.location.origin
    const pathAdjustment =
      window.location.pathname === `/` ? `/index` : window.location.pathname

    const normalizedPath = `/page-data${pathAdjustment}/page-data.json`.replace(
      /\/\//g,
      `/`
    )

    const url = urlHostString + normalizedPath

    try {
      const resp = await fetch(url)
      const data = await resp.text()

      // for local dev with `gatsby develop` where page-data.json files never 404 and return an empty object instead.
      if (data === `{}`) {
        // for local development, force an error if page is missing.
        const err = new Error(`Not Found`)
        err.status = 404
        throw err
      }

      return { data, errorMessage: null }
    } catch (e) {
      if (e.status === 404) {
        return { data: null, errorMessage: `This page has moved.` }
      } else {
        return { data: null, errorMessage: null }
      }
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await fetchPageData()
      pageData = data
    }

    const contentSyncUrlParamInfo = getContentSyncInfoFromURL()

    // prefer content sync
    if (contentSyncUrlParamInfo) {
      setContentSyncInfo(contentSyncUrlParamInfo)
    }
    // fall back to diffing page data
    else {
      fetchData()
    }
  }, [])

  const pollForNodeManifestArgs = {
    contentLoaderInfo: {
      orgId: buildInfo?.siteInfo?.orgId,
      previewBuildStatus: buildInfo?.currentBuild?.buildStatus,
      previewUrl:
        `https://preview-contentfulstartertryingcontent.gtsb.io` ||
        window.location.origin,
    },
    manifestId: contentSyncInfo?.manifestId,
    sourcePluginName: contentSyncInfo?.pluginName,
    siteId: buildInfo?.siteInfo?.siteId,
    shouldPoll: !!buildInfo?.siteInfo && !!contentSyncInfo,
  }

  const {
    redirectUrl: contentSyncRedirectUrl,
    errorMessage: contentSyncErrorMessage,
  } = usePollForNodeManifest(pollForNodeManifestArgs)

  React.useEffect(() => {
    if (contentSyncErrorMessage) {
      console.error(contentSyncErrorMessage)
    } else if (contentSyncRedirectUrl) {
      refreshNeeded = true
    }
  }, [contentSyncInfo, contentSyncRedirectUrl, contentSyncErrorMessage])

  const hasPageDataChanged = async () => {
    if (buildId !== latestCheckedBuild) {
      let pageDataCounter = 0
      let hasPageChanged = false

      while (!hasPageChanged && pageDataCounter <= PAGE_DATA_RETRY_LIMIT) {
        const loadedPageData = pageData
        const { data, errorMessage } = await fetchPageData()

        if (errorMessage) {
          return { hasPageChanged: false, errorMessage }
        }

        pageDataCounter++
        hasPageChanged = loadedPageData !== data

        if (!hasPageChanged) {
          await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL))
        }
      }

      latestCheckedBuild = buildId
      return { hasPageChanged, errorMessage: null }
    }
    return { hasPageChanged: false, errorMessage: null }
  }

  const { siteInfo, currentBuild } = buildInfo || {
    siteInfo: {},
    currentBuild: {},
  }

  const { orgId, siteId } = siteInfo || {}

  const pollData = useCallback(
    async function pollData() {
      const prettyUrlRegex = /^preview-/
      const host = window.location.hostname

      // currentBuild is the most recent build that is not QUEUED.
      // latestBuild is the most recent build that finished running (ONLY status ERROR or SUCCESS)
      const isOnPrettyUrl = prettyUrlRegex.test(host)
      const { siteInfo, currentBuild, latestBuild } = await getBuildInfo()

      if (!buildId) {
        if (isOnPrettyUrl || host === `localhost`) {
          buildId = latestBuild?.id
        } else {
          // Match UUID from preview build URL https://build-af44185e-b8e5-11eb-8529-0242ac130003.gtsb.io
          const buildIdMatch = host?.match(/build-(.*?(?=\.))/)
          if (buildIdMatch) {
            buildId = buildIdMatch[1]
          }
        }
      }

      const newBuildInfo = {
        currentBuild,
        latestBuild,
        siteInfo,
        isOnPrettyUrl,
      }

      if (currentBuild?.buildStatus === BuildStatus.BUILDING) {
        // Keep status as up to date builds where we cannot fetch manifest id info.
        setBuildInfo({ ...newBuildInfo, buildStatus: BuildStatus.BUILDING })
      } else if (
        currentBuild?.buildStatus === BuildStatus.ERROR &&
        !usingContentSync
      ) {
        setBuildInfo({ ...newBuildInfo, buildStatus: BuildStatus.ERROR })
      } else if (buildId && buildId === newBuildInfo?.currentBuild?.id) {
        setBuildInfo({ ...newBuildInfo, buildStatus: BuildStatus.UPTODATE })
      } else if (
        buildId &&
        buildId !== newBuildInfo?.latestBuild?.id &&
        currentBuild?.buildStatus === BuildStatus.SUCCESS
      ) {
        if (refreshNeeded) {
          setBuildInfo({ ...newBuildInfo, buildStatus: BuildStatus.SUCCESS })
        } else if (!usingContentSync) {
          const { hasPageChanged, errorMessage } = await hasPageDataChanged(
            buildId
          )

          if (errorMessage) {
            setBuildInfo({
              ...newBuildInfo,
              buildStatus: BuildStatus.ERROR,
              errorMessage,
            })
          } else if (hasPageChanged) {
            // Force a "This page has updated message" until a page is refreshed
            refreshNeeded = true
            // Build updated, data for this specific page has changed!
            setBuildInfo({ ...newBuildInfo, buildStatus: BuildStatus.SUCCESS })
          } else {
            // Build updated, data for this specific page has NOT changed, no need to refresh content.
            setBuildInfo({ ...newBuildInfo, buildStatus: BuildStatus.UPTODATE })
          }
        }

        if (shouldPoll.current) {
          timeoutRef.current = setTimeout(pollData, POLLING_INTERVAL)
        }
      }
    },
    [contentSyncRedirectUrl]
  )

  useEffect(() => {
    if (buildInfo?.siteInfo && !trackedInitialLoad.current) {
      track({
        eventType: `PREVIEW_INDICATOR_LOADED`,
        buildId,
        orgId,
        siteId,
      })

      trackedInitialLoad.current = true
    }
  }, [buildInfo])

  useEffect(() => {
    shouldPoll.current = true
    pollData()

    return function cleanup() {
      shouldPoll.current = false

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
  }, [])

  const buttonProps = {
    orgId,
    siteId,
    buildId,
    buildStatus: buildInfo?.buildStatus,
    isOnPrettyUrl: buildInfo?.isOnPrettyUrl,
    sitePrefix: siteInfo?.sitePrefix,
    createdAt: currentBuild?.createdAt,
    erroredBuildId: currentBuild?.id,
  }

  return (
    <IndicatorProvider>
      <PreviewIndicator>
        <GatsbyIndicatorButton {...buttonProps} buttonIndex={1} />
        <InfoIndicatorButton
          {...buttonProps}
          contentSyncRedirectUrl={contentSyncRedirectUrl}
          usingContentSync={usingContentSync}
          contentSyncErrorMessage={contentSyncErrorMessage}
          buttonIndex={2}
        />
        <LinkIndicatorButton {...buttonProps} buttonIndex={3} />
      </PreviewIndicator>
    </IndicatorProvider>
  )
}

export { PreviewIndicator }
export default Indicator
