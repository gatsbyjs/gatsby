import React, { useState, useEffect, useCallback, useRef } from "react"

import getBuildInfo from "../utils/getBuildInfo"
import trackEvent from "../utils/trackEvent"
import Style from "./Style"

import GatsbyIndicatorButton from "./GatsbyIndicatorButton"
import LinkIndicatorButton from "./LinkIndicatorButton"
import InfoIndicatorButton from "./InfoIndicatorButton"

const POLLING_INTERVAL = process.env.GATSBY_PREVIEW_POLL_INTERVAL || 3000

export function PreviewIndicator({ children, buildInfo }) {
  console.log(`in the preview indicator`)
  return (
    <>
      <Style />
      <div
        data-testid="preview-status-indicator"
        data-gatsby-preview-indicator="root"
        aria-live="assertive"
      >
        <GatsbyIndicatorButton {...buildInfo} />
        <LinkIndicatorButton {...buildInfo} />
        <InfoIndicatorButton {...buildInfo} />
      </div>
      {children}
    </>
  )
}

export default function Indicator({ children }) {
  const [buildInfo, setBuildInfo] = useState()
  const timeoutRef = useRef()
  const shouldPoll = useRef(false)
  let trackedInitialLoad
  let buildId

  const pollData = useCallback(async function pollData() {
    const prettyUrlRegex = /^preview-/
    const host = window.location.hostname

    // currentBuild is the most recent build that is not QUEUED.
    // latestBuild is the most recent build that finished running (ONLY status ERROR or SUCCESS)
    const isOnPrettyUrl = prettyUrlRegex.test(host)
    const { siteInfo, currentBuild, latestBuild } = await getBuildInfo()

    if (!buildId) {
      if (isOnPrettyUrl) {
        buildId = latestBuild?.id
      } else {
        // Match UUID from preview build URL https://build-af44185e-b8e5-11eb-8529-0242ac130003.gtsb.io
        const buildIdMatch = host.match(/build-(.*?(?=\.))/)
        buildId = buildIdMatch && buildIdMatch[1]
      }
    }

    const defaultBuildInfo = {
      createdAt: currentBuild?.createdAt,
      orgId: siteInfo?.orgId,
      siteId: siteInfo?.siteId,
      buildId,
      isOnPrettyUrl,
      sitePrefix: siteInfo?.sitePrefix,
    }

    if (!trackedInitialLoad) {
      trackEvent({
        eventType: `PREVIEW_INDICATOR_LOADED`,
        orgId: defaultBuildInfo.orgId,
        siteId: defaultBuildInfo.siteId,
        buildId,
      })

      trackedInitialLoad = true
    }

    if (currentBuild?.buildStatus === `BUILDING`) {
      setBuildInfo({
        status: `BUILDING`,
        ...defaultBuildInfo,
      })
    } else if (currentBuild?.buildStatus === `ERROR`) {
      setBuildInfo({
        status: `ERROR`,
        errorBuildId: currentBuild?.id,
        ...defaultBuildInfo,
      })
    } else if (buildId === currentBuild?.id) {
      setBuildInfo({
        status: `UPTODATE`,
        ...defaultBuildInfo,
      })
    } else if (
      buildId !== latestBuild?.id &&
      latestBuild?.buildStatus === `SUCCESS`
    ) {
      setBuildInfo({
        status: `SUCCESS`,
        ...defaultBuildInfo,
      })
    }

    if (shouldPoll.current) {
      setTimeout(pollData, POLLING_INTERVAL)
    }
  }, [])

  useEffect(() => {
    shouldPoll.current = true
    pollData()

    return function cleanup() {
      shouldPoll.current = false

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return <PreviewIndicator buildInfo={buildInfo}>{children}</PreviewIndicator>
}
