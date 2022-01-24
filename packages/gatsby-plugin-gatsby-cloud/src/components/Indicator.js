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

const POLLING_INTERVAL = process.env.GATSBY_PREVIEW_POLL_INTERVAL
  ? parseInt(process.env.GATSBY_PREVIEW_POLL_INTERVAL)
  : 2000

const pageDataRetryLimit = 15

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

let buildId = ``
let pageData
let latestCheckedBuild
let pageDataCounter = 0

const Indicator = () => {
  const [buildInfo, setBuildInfo] = useState()
  const timeoutRef = useRef(null)
  const shouldPoll = useRef(false)
  const trackedInitialLoad = useRef(false)
  const { track } = useTrackEvent()

  async function fetchPageData() {
    const urlHostString = window.location.origin
    const pathAdjustment =
      window.location.pathname === `/` ? `/index` : window.location.pathname

    const url = `${urlHostString}/page-data${pathAdjustment}/page-data.json`

    const resp = await fetch(url)
    const data = await resp.text()

    return data
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetchPageData()
      pageData = data
    }

    fetchData().catch(console.error)
  }, [])

  const hasPageDataChanged = async () => {
    if (buildId !== latestCheckedBuild || !pageData) {
      const loadedPageData = pageData
      const newData = await fetchPageData()
      pageDataCounter++

      const hasPageChanged = loadedPageData !== newData
      if (hasPageChanged || pageDataCounter == pageDataRetryLimit) {
        pageDataCounter = 0
        latestCheckedBuild = buildId
        pageData = newData
      }
      return hasPageChanged
    }
    return false
  }

  const { siteInfo, currentBuild } = buildInfo || {
    siteInfo: {},
    currentBuild: {},
  }

  const { orgId, siteId } = siteInfo || {}

  const pollData = useCallback(async function pollData() {
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

    console.log(`Build Status`, currentBuild?.buildStatus)
    if (currentBuild?.buildStatus === BuildStatus.BUILDING) {
      // setBuildInfo({ ...newBuildInfo, buildStatus: BuildStatus.BUILDING })
      setBuildInfo({ ...newBuildInfo, buildStatus: BuildStatus.UPTODATE })
    } else if (currentBuild?.buildStatus === BuildStatus.ERROR) {
      setBuildInfo({ ...newBuildInfo, buildStatus: BuildStatus.ERROR })
    } else if (buildId && buildId === newBuildInfo?.currentBuild?.id) {
      setBuildInfo({ ...newBuildInfo, buildStatus: BuildStatus.UPTODATE })
    } else if (
      buildId &&
      buildId !== newBuildInfo?.latestBuild?.id &&
      currentBuild?.buildStatus === BuildStatus.SUCCESS
    ) {
      if (await hasPageDataChanged(buildId)) {
        // Build updated, data for this specific page has changed!
        setBuildInfo({ ...newBuildInfo, buildStatus: `SUCCESS` })
      } else {
        // Build updated, data for this specific page has NOT changed, no need to refresh content.
        setBuildInfo({ ...newBuildInfo, buildStatus: `UPTODATE` })
      }
    }

    if (shouldPoll.current) {
      timeoutRef.current = setTimeout(pollData, POLLING_INTERVAL)
    }
  }, [])

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
        <InfoIndicatorButton {...buttonProps} buttonIndex={2} />
        <LinkIndicatorButton {...buttonProps} buttonIndex={3} />
      </PreviewIndicator>
    </IndicatorProvider>
  )
}

export { PreviewIndicator }
export default Indicator
