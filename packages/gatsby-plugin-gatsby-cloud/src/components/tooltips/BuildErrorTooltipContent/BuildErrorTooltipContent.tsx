import React, { FC, useContext, useMemo } from "react"
import IndicatorContext from "../../../context/IndicatorContext"
import { EventType } from "../../../models/enums"
import { logsIcon, failedIcon } from "../../icons"

const BuildErrorTooltipContent: FC = () => {
  const { buildInfo, currentBuildId, trackEvent } = useContext(IndicatorContext)

  const buildLogUrl = useMemo((): string => {
    let pathToBuildLogs = ``
    if (!currentBuildId && buildInfo?.siteInfo) {
      const { orgId, siteId } = buildInfo.siteInfo
      if (!currentBuildId) {
        pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/cmsPreview`
      } else {
        pathToBuildLogs = `https://www.gatsbyjs.com/dashboard/${orgId}/sites/${siteId}/builds/${currentBuildId}/details`
      }
      const returnTo = encodeURIComponent(pathToBuildLogs)
      return `${pathToBuildLogs}?returnTo=${returnTo}`
    }
    return pathToBuildLogs
  }, [buildInfo?.siteInfo?.orgId, buildInfo?.siteInfo?.siteId, currentBuildId])

  return (
    <>
      {failedIcon}
      {buildInfo?.errorMessage}
      <a
        href={buildLogUrl}
        target="_blank"
        rel="noreferrer"
        onClick={(): void => {
          trackEvent({
            eventType: EventType.PREVIEW_INDICATOR_CLICK,
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
