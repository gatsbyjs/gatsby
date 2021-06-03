import React, { useState, useEffect, useCallback, useRef } from "react"
import { formatDistance } from "date-fns"
import getBuildInfo from "../utils/getBuildInfo"
import trackEvent from "../utils/trackEvent"
import IndicatorButton from "./IndicatorButton"
import {
  gatsbyIcon,
  logsIcon,
  failedIcon,
  infoIcon,
  linkIcon,
  successIcon,
} from "./icons"
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
        {children}
      </div>
    </>
  )
}

export function GatsbyIndicatorButton(props) {
  return <IndicatorButton testId="gatsby" iconSvg={gatsbyIcon} {...props} />
}

export function LinkIndicatorButton(props) {
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
    <IndicatorButton
      testId={`link`}
      iconSvg={linkIcon}
      onClick={copyLinkClick}
      {...linkButtonCopyProps}
      {...props}
    />
  )
}

export function InfoIndicatorButton(props) {
  return <IndicatorButton testId="info" iconSvg={infoIcon} {...props} />
}

const viewLogsClick = ({ orgId, siteId, errorBuildId }) => {
  const pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/builds/${errorBuildId}/details`
  const returnTo = encodeURIComponent(pathToBuildLogs)

  window.open(`${pathToBuildLogs}?returnTo=${returnTo}`)
}

const newPreviewAvailableClick = ({ isOnPrettyUrl, sitePrefix }) => {
  // Grabs domain that preview is hosted on https://preview-sitePrefix.gtsb.io
  // This will match `gtsb.io`
  const previewDomain = window.location.hostname.split(`.`).slice(-2).join(`.`)

  if (isOnPrettyUrl || window.location.hostname === `localhost`) {
    window.location.reload()
  } else {
    window.location.replace(
      `https://preview-${sitePrefix}.${previewDomain}${window.location.pathname}`
    )
  }
}

export default function Indicator() {
  const [buildInfo, setBuildInfo] = useState()
  const timeoutRef = useRef()
  const shouldPoll = useRef(false)
  let trackedInitialLoad
  let buildId
  const buildStatus = buildInfo?.currentBuild?.buildStatus

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

    if (!trackedInitialLoad) {
      trackEvent({
        eventType: `PREVIEW_INDICATOR_LOADED`,
        orgId: siteInfo.orgId,
        siteId: siteInfo.siteId,
        buildId,
      })

      trackedInitialLoad = true
    }

    setBuildInfo({
      currentBuild,
      latestBuild,
      siteInfo,
      isOnPrettyUrl,
    })

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

  if (buildStatus === `BUILDING`) {
    return (
      <PreviewIndicator>
        <GatsbyIndicatorButton
          tooltipText={`Building a new preview`}
          showSpinner={true}
          overrideShowTooltip={true}
        />
        <LinkIndicatorButton tooltipText={`Copy link`} active={true} />
        <InfoIndicatorButton />
      </PreviewIndicator>
    )
  }

  if (buildStatus === `ERROR`) {
    return (
      <PreviewIndicator>
        <GatsbyIndicatorButton
          tooltipText={`Preview error`}
          overrideShowTooltip={true}
          active={true}
          tooltipIcon={failedIcon}
          tooltipLink={`View logs`}
          tooltipLinkImage={logsIcon}
          onClick={() =>
            viewLogsClick({
              orgId: buildInfo?.siteInfo?.orgId,
              siteId: buildInfo?.siteInfo?.siteId,
              errorBuildId: buildInfo?.currentBuild?.id,
            })
          }
        />
        <LinkIndicatorButton />
        <InfoIndicatorButton />
      </PreviewIndicator>
    )
  }

  if (buildId && buildId === buildInfo?.currentBuild?.id) {
    const updatedDate = formatDistance(
      Date.now(),
      new Date(buildInfo?.currentBuild?.createdAt),
      { includeSeconds: true }
    )
    return (
      <PreviewIndicator>
        <GatsbyIndicatorButton active={true} />
        <LinkIndicatorButton tooltipText={`Copy link`} active={true} />
        <InfoIndicatorButton
          tooltipText={`Preview updated ${updatedDate} ago`}
          active={true}
        />
      </PreviewIndicator>
    )
  }

  if (
    buildId &&
    buildId !== buildInfo?.latestBuild?.id &&
    buildStatus === `SUCCESS`
  ) {
    return (
      <PreviewIndicator>
        <GatsbyIndicatorButton
          tooltipText={`New preview available`}
          overrideShowTooltip={true}
          active={true}
          onClick={() =>
            newPreviewAvailableClick({
              isOnPrettyUrl: buildInfo?.isOnPrettyUrl,
              sitePrefix: buildInfo?.siteInfo?.sitePrefix,
            })
          }
          tooltipLink={`Click to view`}
        />
        <LinkIndicatorButton />
        <InfoIndicatorButton />
      </PreviewIndicator>
    )
  }

  return (
    <PreviewIndicator>
      <GatsbyIndicatorButton active={false} />
      <LinkIndicatorButton active={false} />
      <InfoIndicatorButton active={false} />
    </PreviewIndicator>
  )
}
