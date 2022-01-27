import React from "react"
import { logsIcon, failedIcon } from "../icons"
import { useTrackEvent } from "../../utils"

const generateBuildLogUrl = ({ orgId, siteId, buildId }) => {
  let pathToBuildLogs = ``

  if (!buildId) {
    pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/cmsPreview`
  } else {
    pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/builds/${buildId}/details`
  }

  const returnTo = encodeURIComponent(pathToBuildLogs)

  return `${pathToBuildLogs}?returnTo=${returnTo}`
}

const BuildErrorTooltipContent = ({
  siteId,
  orgId,
  buildId,
  errorMessage = `Unable to build preview`,
}) => {
  const { track } = useTrackEvent()
  return (
    <>
      {failedIcon}
      {errorMessage}
      <a
        href={generateBuildLogUrl({ orgId, siteId, buildId })}
        target="_blank"
        rel="noreferrer"
        onClick={() => {
          track({
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

export default BuildErrorTooltipContent
