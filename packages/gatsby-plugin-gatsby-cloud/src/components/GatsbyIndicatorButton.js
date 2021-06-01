import { logsIcon, failedIcon } from "./icons"

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
