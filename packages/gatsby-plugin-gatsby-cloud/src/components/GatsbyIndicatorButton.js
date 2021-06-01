import React from "react"

import trackEvent from "../utils/trackEvent"
import IndicatorButton from "./IndicatorButton"

export const gatsbyIcon = (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2C13.3132 2 14.6136 2.25866 15.8268 2.7612C17.0401 3.26375 18.1425 4.00035 19.0711 4.92893C19.9997 5.85752 20.7362 6.95991 21.2388 8.17317C21.7413 9.38642 22 10.6868 22 12C22 14.6522 20.9464 17.1957 19.0711 19.0711C17.1957 20.9464 14.6522 22 12 22C10.6868 22 9.38642 21.7413 8.17317 21.2388C6.95991 20.7362 5.85752 19.9997 4.92893 19.0711C3.05357 17.1957 2 14.6522 2 12C2 9.34784 3.05357 6.8043 4.92893 4.92893C6.8043 3.05357 9.34784 2 12 2V2ZM12 4C8.27 4 5.14 6.55 4.25 10L14 19.75C17.45 18.86 20 15.73 20 12L14.75 12V13.5H18.2C17.71 15.54 16.24 17.19 14.31 17.94L6.06 9.69C7 7.31 9.3 5.63 12 5.63C14.13 5.63 16 6.67 17.18 8.28L18.41 7.22C16.95 5.26 14.63 4 12 4ZM4 12C4 14.1217 4.84285 16.1566 6.34315 17.6569C7.84344 19.1571 9.87827 20 12 20C12.04 20 12.09 20 4 12Z"
      fill="#8A4BAF"
    />
  </svg>
)

const logsIcon = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.6667 12.6667H3.33333V3.33333H8V2H3.33333C2.59333 2 2 2.6 2 3.33333V12.6667C2 13.4 2.59333 14 3.33333 14H12.6667C13.4 14 14 13.4 14 12.6667V8H12.6667V12.6667ZM9.33333 2V3.33333H11.7267L5.17333 9.88667L6.11333 10.8267L12.6667 4.27333V6.66667H14V2H9.33333Z"
      fill="#B17ACC"
    />
  </svg>
)

const failedIcon = (
  <svg
    style={{ marginRight: `5px` }}
    width="8"
    height="8"
    viewBox="0 0 8 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="4" cy="4" r="4" fill="#EC1818" />
  </svg>
)

const waitForTrackEventToFire = ms =>
  new Promise(resolve => setTimeout(resolve, ms || 50))

const newPreviewAvailableClick = async ({
  isOnPrettyUrl,
  sitePrefix,
  orgId,
  siteId,
  buildId,
}) => {
  // Grabs domain that preview is hosted on https://preview-sitePrefix.gtsb.io
  // This will match `gtsb.io`
  const previewDomain = window.location.hostname.split(`.`).slice(-2).join(`.`)

  trackEvent({
    eventType: `PREVIEW_INDICATOR_CLICK`,
    orgId,
    siteId,
    buildId,
    name: `new preview`,
  })

  await waitForTrackEventToFire(75)

  if (isOnPrettyUrl || window.location.hostname === `localhost`) {
    window.location.reload()
  } else {
    window.location.replace(
      `https://preview-${sitePrefix}.${previewDomain}${window.location.pathname}`
    )
  }
}

const viewLogsClick = ({ orgId, siteId, buildId, errorBuildId }) => {
  const pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/builds/${errorBuildId}/details`
  const returnTo = encodeURIComponent(pathToBuildLogs)

  trackEvent({
    eventType: `PREVIEW_INDICATOR_CLICK`,
    orgId,
    siteId,
    buildId,
    name: `error logs`,
  })

  window.open(`${pathToBuildLogs}?returnTo=${returnTo}`)
}

export const getButtonProps = ({
  status,
  orgId,
  siteId,
  buildId,
  errorBuildId,
  isOnPrettyUrl,
  sitePrefix,
}) => {
  switch (status) {
    case `SUCCESS`: {
      return {
        tooltipText: `New preview available`,
        overrideShowTooltip: true,
        active: true,
        onClick: () =>
          newPreviewAvailableClick({
            isOnPrettyUrl,
            sitePrefix,
            orgId,
            siteId,
            buildId,
          }),
        tooltipLink: `Click to view`,
      }
    }
    case `ERROR`: {
      return {
        tooltipText: `Preview error`,
        overrideShowTooltip: true,
        active: true,
        tooltipIcon: failedIcon,
        tooltipLink: `View logs`,
        tooltipLinkImage: logsIcon,
        onClick: () => viewLogsClick({ orgId, siteId, buildId, errorBuildId }),
      }
    }
    case `BUILDING`: {
      return {
        tooltipText: `Building a new preview`,
        showSpinner: true,
        overrideShowTooltip: true,
      }
    }
    case `UPTODATE`: {
      return {
        tooltipText: ``,
        active: true,
      }
    }
    default: {
      return {
        tooltipText: `Fetching preview info...`,
        showSpinner: true,
        overrideShowTooltip: true,
        active: false,
      }
    }
  }
}
