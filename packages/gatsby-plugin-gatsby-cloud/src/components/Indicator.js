import React, { useState, useEffect, useCallback, useRef } from "react"
import getBuildInfo from "../utils/getBuildInfo"
import trackEvent from "../utils/trackEvent"
import IndicatorButton from "./IndicatorButton"
import { getButtonProps as getIndicatorButtonProps } from "./GatsbyIndicatorButton"
import { getButtonProps as getInfoIndicatorButtonProps } from "./InfoIndicatorButton"
import { getButtonProps as getLinkIndicatorButtonProps } from "./LinkIndicatorButton"
import {
  gatsbyIcon,
  infoIcon,
  linkIcon,
  successIcon,
} from "./icons"
import Style from "./Style"

const POLLING_INTERVAL = process.env.GATSBY_PREVIEW_POLL_INTERVAL || 3000

export function PreviewIndicator({
  children,
  gatsbyIndicatorButtonProps,
  linkIndicatorButtonProps,
  infoIndicatorButtonProps,
}) {
  const [linkButtonCopyProps, setLinkButtonCopyProps] = useState()

  const copyLinkClick = () => {
    setLinkButtonCopyProps({
      tooltipIcon: successIcon,
      overrideShowTooltip: true,
      tooltipText: `Link copied`,
    })

    setTimeout(() => {
      setLinkButtonCopyProps({
        tooltipIcon: successIcon,
        overrideShowTooltip: false,
        tooltipText: `Link copied`,
      })
      // We want the tooltip to linger for two seconds to let the user know it has been copied
    }, 2000)

    setTimeout(() => {
      setLinkButtonCopyProps({ tooltipText: `Copy Link` })
      // The tooltips fade out, in order to make sure that the text does not change
      // while it is fading out we need to wait a bit longer than the time used above.
    }, 2400)

    navigator.clipboard.writeText(window.location.href)
  }

  return (
    <>
      <Style />
      <div
        data-testid="preview-status-indicator"
        data-gatsby-preview-indicator="root"
        aria-live="assertive"
      >
        <IndicatorButton
          testId="gatsby"
          iconSvg={gatsbyIcon}
          isFirstButton={true}
          {...gatsbyIndicatorButtonProps}
        />
        <IndicatorButton
          testId={`link`}
          iconSvg={linkIcon}
          toolTipOffset={40}
          onClick={copyLinkClick}
          {...linkButtonCopyProps}
          {...linkIndicatorButtonProps}
        />
        <IndicatorButton
          testId="info"
          iconSvg={infoIcon}
          {...infoIndicatorButtonProps}
          toolTipOffset={80}
        />
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

  const {
    status,
    orgId,
    siteId,
    errorBuildId,
    isOnPrettyUrl,
    sitePrefix,
    createdAt,
  } = buildInfo

  return (
    <PreviewIndicator
      buildInfo={buildInfo}
      gatsbyIndicatorButtonProps={{
        ...getIndicatorButtonProps({
          status,
          orgId,
          siteId,
          errorBuildId,
          isOnPrettyUrl,
          sitePrefix,
        }),
      }}
      linkIndicatorButtonProps={{
        ...getLinkIndicatorButtonProps({
          status,
        }),
      }}
      infoIndicatorButtonProps={{
        ...getInfoIndicatorButtonProps({
          status,
          createdAt,
        }),
      }}
    >
      {children}
    </PreviewIndicator>
  )
}
