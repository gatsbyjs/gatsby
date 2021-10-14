import React, { useState, useEffect, useCallback, useRef } from "react"
import getBuildInfo from "../utils/getBuildInfo"
import trackEvent from "../utils/trackEvent"
import {
  LinkIndicatorButton,
  InfoIndicatorButton,
  GatsbyIndicatorButton,
} from "./buttons"
import Style from "./Style"

const POLLING_INTERVAL = process.env.GATSBY_PREVIEW_POLL_INTERVAL || 3000

export function PreviewIndicator({ children }) {
  return (
    <>
      <Style />
      <div
        data-testid="preview-status-indicator"
        data-gatsby-preview-indicator="root"
        aria-live="assertive"
      >
        {React.Children.map(children, (child, i) =>
          React.cloneElement(child, { ...child.props, buttonIndex: i })
        )}
      </div>
    </>
  )
}

let buildId

export default function Indicator() {
  const [buildInfo, setBuildInfo] = useState()

  const timeoutRef = useRef()
  const shouldPoll = useRef(false)
  const trackedInitialLoad = useRef(false)

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

    if (currentBuild?.buildStatus === `BUILDING`) {
      setBuildInfo({ ...newBuildInfo, buildStatus: `BUILDING` })
    } else if (currentBuild?.buildStatus === `ERROR`) {
      setBuildInfo({ ...newBuildInfo, buildStatus: `ERROR` })
    } else if (buildId && buildId === newBuildInfo?.currentBuild?.id) {
      setBuildInfo({ ...newBuildInfo, buildStatus: `UPTODATE` })
    } else if (
      buildId &&
      buildId !== newBuildInfo?.latestBuild?.id &&
      currentBuild?.buildStatus === `SUCCESS`
    ) {
      setBuildInfo({ ...newBuildInfo, buildStatus: `SUCCESS` })
    }

    if (shouldPoll.current) {
      timeoutRef.current = setTimeout(pollData, POLLING_INTERVAL)
    }
  }, [])

  useEffect(() => {
    if (buildInfo?.siteInfo && !trackedInitialLoad.current) {
      trackEvent({
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
    <PreviewIndicator>
      <GatsbyIndicatorButton {...buttonProps} />
      <LinkIndicatorButton {...buttonProps} />
      <InfoIndicatorButton {...buttonProps} />
    </PreviewIndicator>
  )
}
