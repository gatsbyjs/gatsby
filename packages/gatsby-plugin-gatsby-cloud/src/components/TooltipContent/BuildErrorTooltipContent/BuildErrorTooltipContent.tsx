import React, { FC, useContext, useMemo } from "react"
import IndicatorContext from "../../../context/IndicatorContext"
import { EventType } from "../../../models/enums"
import { logsIcon, failedIcon } from "../../icons"
import { linkWrapperStyle, linkTextStyle } from "../tooltip-content.css"

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
      {buildInfo?.errorMessage || `Unable to build preview`}
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
        className={linkWrapperStyle}
      >
        <span className={linkTextStyle}>{`View logs`}</span>
        {logsIcon}
      </a>
    </>
  )
}

export default BuildErrorTooltipContent
