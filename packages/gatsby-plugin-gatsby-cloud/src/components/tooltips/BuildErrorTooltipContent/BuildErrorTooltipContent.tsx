import React, { FC, useContext, useMemo } from "react"
import IndicatorContext from "../../../context/IndicatorContext"
import { EventType } from "../../../models/enums"
import { logsIcon, failedIcon } from "../../icons"

interface IBuildErrorTooltipContent {
  siteId: string
  orgId: string
  buildId: string
  errorMessage: string
}

const BuildErrorTooltipContent: FC<IBuildErrorTooltipContent> = ({
  siteId,
  orgId,
  buildId,
  errorMessage = `Unable to build preview`,
}) => {
  const { trackEvent } = useContext(IndicatorContext)

  const buildLogUrl = useMemo((): string => {
    let pathToBuildLogs = ``
    if (!buildId) {
      pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/cmsPreview`
    } else {
      pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/builds/${buildId}/details`
    }
    const returnTo = encodeURIComponent(pathToBuildLogs)
    return `${pathToBuildLogs}?returnTo=${returnTo}`
  }, [orgId, siteId, buildId])

  return (
    <>
      {failedIcon}
      {errorMessage}
      <a
        href={buildLogUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(): void => {
          trackEvent({
            eventType: EventType.PREVIEW_INDICATOR_CLICK,
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
