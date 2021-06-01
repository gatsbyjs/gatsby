import { logsIcon, failedIcon } from "./icons"

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

const viewLogsClick = ({ orgId, siteId, errorBuildId }) => {
  const pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/builds/${errorBuildId}/details`
  const returnTo = encodeURIComponent(pathToBuildLogs)

  window.open(`${pathToBuildLogs}?returnTo=${returnTo}`)
}

const getGatsbyIndicatorButtonProps = ({
  status,
  orgId,
  siteId,
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
        onClick: () => newPreviewAvailableClick({ isOnPrettyUrl, sitePrefix }),
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
        onClick: () => viewLogsClick({ orgId, siteId, errorBuildId }),
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

export default getGatsbyIndicatorButtonProps
