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
      </div>
    </>
  )
}

export function GatsbyIndicatorButton(props) {
  return <IndicatorButton testId="gatsby" iconSvg={gatsbyIcon} {...props} />
}

const copySuccessTooltip = (
  <>
    {successIcon}
    {`Link copied`}
  </>
)

export function LinkIndicatorButton(props) {
  const { orgId, siteId, buildId, active } = props
  const [linkButtonCopyProps, setLinkButtonCopyProps] = useState()

  const copyLinkClick = () => {
    trackEvent({
      eventType: `PREVIEW_INDICATOR_CLICK`,
      orgId,
      siteId,
      buildId,
      name: `copy link`,
    })

    setLinkButtonCopyProps({
      tooltipContent: copySuccessTooltip,
      overrideShowTooltip: true,
    })

    setTimeout(() => {
      setLinkButtonCopyProps({
        tooltipContent: copySuccessTooltip,
        overrideShowTooltip: false,
      })
      // We want the tooltip to linger for two seconds to let the user know it has been copied
    }, 2000)

    setTimeout(() => {
      setLinkButtonCopyProps({ tooltipContent: `Copy Link` })
      // The tooltips fade out, in order to make sure that the text does not change
      // while it is fading out we need to wait a bit longer than the time used above.
    }, 2400)

    if (window) {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const trackHover = () => {
    if (!active) return
    trackEvent({
      eventType: `PREVIEW_INDICATOR_HOVER`,
      orgId,
      siteId,
      buildId,
      name: `link hover`,
    })
  }

  return (
    <IndicatorButton
      testId={`link`}
      iconSvg={linkIcon}
      onClick={copyLinkClick}
      onMouseEnter={trackHover}
      {...props}
      {...linkButtonCopyProps}
    />
  )
}

export function InfoIndicatorButton(props) {
  const { active, orgId, siteId, buildId } = props
  const trackHover = () => {
    if (!active) return
    trackEvent({
      eventType: `PREVIEW_INDICATOR_HOVER`,
      orgId,
      siteId,
      buildId,
      name: `info hover`,
    })
  }
  return (
    <IndicatorButton
      testId="info"
      iconSvg={infoIcon}
      onMouseEnter={trackHover}
      {...props}
    />
  )
}

export function BuildErrorIndicatorTooltip({ siteId, orgId, buildId }) {
  return (
    <>
      {failedIcon}
      {`Unable to build preview`}
      <a
        href={generateBuildLogUrl({ orgId, siteId, buildId })}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          trackEvent({
            eventType: `PREVIEW_INDICATOR_CLICK`,
            orgId,
            siteId,
            buildId,
            name: `error logs`,
          })
        }}
        data-gatsby-preview-indicator="tooltip-link"
      >
        <p data-gatsby-preview-indicator="tooltip-link-text">{`View logs`}</p>
        <div data-gatsby-preview-indicator="tooltip-svg">{logsIcon}</div>
      </a>
    </>
  )
}

function BuildSuccessIndicatorTooltip({
  isOnPrettyUrl,
  sitePrefix,
  orgId,
  siteId,
  buildId,
}) {
  return (
    <>
      {`New preview available`}
      <button
        onClick={() => {
          newPreviewAvailableClick({
            isOnPrettyUrl,
            sitePrefix,
            orgId,
            siteId,
            buildId,
          })
        }}
        data-gatsby-preview-indicator="tooltip-link"
      >
        <p data-gatsby-preview-indicator="tooltip-link-text">{`Click to view`}</p>
      </button>
    </>
  )
}

const generateBuildLogUrl = ({ orgId, siteId, buildId }) => {
  const pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/builds/${buildId}/details`
  const returnTo = encodeURIComponent(pathToBuildLogs)

  return `${pathToBuildLogs}?returnTo=${returnTo}`
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms || 50))

const newPreviewAvailableClick = async ({
  isOnPrettyUrl,
  sitePrefix,
  orgId,
  siteId,
  buildId,
}) => {
  trackEvent({
    eventType: `PREVIEW_INDICATOR_CLICK`,
    orgId,
    siteId,
    buildId,
    name: `new preview`,
  })

  /**
   * Delay to ensure that track event fires but do not await trackEvent directly since we do not
   * want to block the thread until the event request comes back
   */
  await delay(75)

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
  const trackedInitialLoad = useRef(false)
  const [buildId, setBuildId] = useState()

  const { siteInfo, currentBuild } = buildInfo || {
    siteInfo: {},
    currentBuild: {},
  }
  const { orgId, siteId } = siteInfo || {}
  const { buildStatus } = currentBuild || {}

  const pollData = useCallback(async function pollData() {
    const prettyUrlRegex = /^preview-/
    const host = window.location.hostname

    // currentBuild is the most recent build that is not QUEUED.
    // latestBuild is the most recent build that finished running (ONLY status ERROR or SUCCESS)
    const isOnPrettyUrl = prettyUrlRegex.test(host)
    const { siteInfo, currentBuild, latestBuild } = await getBuildInfo()

    if (!buildId) {
      if (isOnPrettyUrl || host === `localhost`) {
        setBuildId(latestBuild?.id)
      } else {
        // Match UUID from preview build URL https://build-af44185e-b8e5-11eb-8529-0242ac130003.gtsb.io
        const buildIdMatch = host?.match(/build-(.*?(?=\.))/)
        if (buildIdMatch) {
          setBuildId(buildIdMatch[1])
        }
      }
    }

    setBuildInfo({
      currentBuild,
      latestBuild,
      siteInfo,
      isOnPrettyUrl,
    })

    if (shouldPoll.current) {
      timeoutRef.current = setTimeout(pollData, POLLING_INTERVAL)
    }
  }, [])

  useEffect(() => {
    if (buildInfo?.siteInfo && !trackedInitialLoad.current) {
      const { siteInfo } = buildInfo
      trackEvent({
        eventType: `PREVIEW_INDICATOR_LOADED`,
        orgId: siteInfo?.orgId,
        siteId: siteInfo?.siteId,
        buildId,
      })

      trackedInitialLoad.current = true
    }
  }, [buildInfo, buildId])

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

  const trackEventProps = { buildId, siteId, orgId }

  if (buildStatus === `BUILDING`) {
    return (
      <PreviewIndicator>
        <GatsbyIndicatorButton
          tooltipContent={`Building a new preview`}
          showSpinner={true}
          overrideShowTooltip={true}
        />
        <LinkIndicatorButton
          tooltipContent={`Copy link`}
          active={true}
          {...trackEventProps}
        />
        <InfoIndicatorButton {...trackEventProps} />
      </PreviewIndicator>
    )
  }

  if (buildStatus === `ERROR`) {
    return (
      <PreviewIndicator>
        <GatsbyIndicatorButton
          tooltipContent={
            <BuildErrorIndicatorTooltip
              siteId={siteId}
              orgId={orgId}
              buildId={currentBuild.id}
            />
          }
          overrideShowTooltip={true}
          active={true}
        />
        <LinkIndicatorButton {...trackEventProps} />
        <InfoIndicatorButton {...trackEventProps} />
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
        <LinkIndicatorButton
          tooltipContent={`Copy link`}
          active={true}
          {...trackEventProps}
        />
        <InfoIndicatorButton
          tooltipContent={`Preview updated ${updatedDate} ago`}
          active={true}
          {...trackEventProps}
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
          tooltipContent={
            <BuildSuccessIndicatorTooltip
              isOnPrettyUrl={buildInfo?.isOnPrettyUrl}
              sitePrefix={buildInfo?.siteInfo?.sitePrefix}
              buildId={buildId}
              siteId={siteId}
              orgId={orgId}
            />
          }
          overrideShowTooltip={true}
          active={true}
          onClick={() =>
            newPreviewAvailableClick({
              isOnPrettyUrl: buildInfo?.isOnPrettyUrl,
              sitePrefix: buildInfo?.siteInfo?.sitePrefix,
            })
          }
        />
        <LinkIndicatorButton {...trackEventProps} />

        <InfoIndicatorButton {...trackEventProps} />
      </PreviewIndicator>
    )
  }

  return (
    <PreviewIndicator>
      <GatsbyIndicatorButton active={false} />
      <LinkIndicatorButton active={false} {...trackEventProps} />
      <InfoIndicatorButton active={false} {...trackEventProps} />
    </PreviewIndicator>
  )
}
