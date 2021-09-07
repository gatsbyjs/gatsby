import React from "react"
import { logsIcon, failedIcon } from "../icons"
import trackEvent from "../../utils/trackEvent"

const generateBuildLogUrl = ({ orgId, siteId, buildId }) => {
  let pathToBuildLogs

  if (!buildId) {
    pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/cmsPreview`
  } else {
    pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/builds/${buildId}/details`
  }

  const returnTo = encodeURIComponent(pathToBuildLogs)

  return `${pathToBuildLogs}?returnTo=${returnTo}`
}

export default function BuildErrorTooltipContent({ siteId, orgId, buildId }) {
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
