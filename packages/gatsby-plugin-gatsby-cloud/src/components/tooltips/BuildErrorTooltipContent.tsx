import React, { FC } from "react"
import { logsIcon, failedIcon } from "../icons"
import trackEvent from "../../utils/trackEvent"

interface IBuildErrorTooltipContentProps {
  siteId: string
  orgId: string
  buildId: string
}

const generateBuildLogUrl = ({
  orgId,
  siteId,
  buildId,
}: IBuildErrorTooltipContentProps): string => {
  let pathToBuildLogs = ``

  if (!buildId) {
    pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/cmsPreview`
  } else {
    pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/builds/${buildId}/details`
  }

  const returnTo = encodeURIComponent(pathToBuildLogs)

  return `${pathToBuildLogs}?returnTo=${returnTo}`
}

const BuildErrorTooltipContent: FC<IBuildErrorTooltipContentProps> = ({
  siteId,
  orgId,
  buildId,
}) => (
  <>
    {failedIcon}
    {`Unable to build preview`}
    <a
      href={generateBuildLogUrl({ orgId, siteId, buildId })}
      target="_blank"
      rel="noreferrer"
      onClick={(): void => {
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

export default BuildErrorTooltipContent
