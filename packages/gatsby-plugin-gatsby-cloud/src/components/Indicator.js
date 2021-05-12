import React, { useState, useEffect, useCallback, useRef } from "react"

import getBuildInfo from "../utils/getBuildInfo"
import Style from "./Style"

import GatsbyIndicatorButton from "./GatsbyIndicatorButton"
import LinkIndicatorButton from "./LinkIndicatorButton"
import InfoIndicatorButton from "./InfoIndicatorButton"

const POLLING_INTERVAL = process.env.GATSBY_PREVIEW_POLL_INTERVAL || 3000

export default function Indicator({ children }) {
  const [buildInfo, setBuildInfo] = useState()
  const timeoutRef = useRef()
  const shouldPoll = useRef(false)
  const pollData = useCallback(async function pollData() {
    const prettyUrlRegex = /^preview-/
    const host = window.location.hostname
    let buildId

    // currentBuild is the most recent build that is not QUEUED.
    // latestBuild is the most recent build that finished running (ONLY status ERROR or SUCCESS)
    const isOnPrettyUrl = prettyUrlRegex.test(host)
    const { siteInfo, currentBuild, latestBuild } = await getBuildInfo()
    console.log(currentBuild, latestBuild, siteInfo)

    // buildId = "b4ac0f53-63ce-405c-ab78-90f7dada0dd8"
    if (!buildId) {
      if (isOnPrettyUrl) {
        buildId = latestBuild?.id
      } else {
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

    if (currentBuild?.buildStatus === `BUILDING`) {
      setBuildInfo({
        status: `BUILDING`,
        ...defaultBuildInfo,
      })
    } else if (currentBuild?.buildStatus === `ERROR`) {
      setBuildInfo({
        status: `ERROR`,
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
