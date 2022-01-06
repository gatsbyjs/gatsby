import React from "react"
import { formatDistance } from "date-fns"
import trackEvent from "../../utils/trackEvent"

import IndicatorButton from "./IndicatorButton"
import { infoIcon, infoIconActive } from "../icons"
import {
  BuildErrorTooltipContent,
  BuildSuccessTooltipContent,
} from "../tooltips"

const getButtonProps = props => {
  const {
    createdAt,
    buildStatus,
    erroredBuildId,
    isOnPrettyUrl,
    sitePrefix,
    siteId,
    buildId,
    orgId,
  } = props

  switch (buildStatus) {
    case `UPTODATE`: {
      return {
        tooltipContent: `Preview updated ${formatDistance(
          Date.now(),
          new Date(createdAt),
          { includeSeconds: true }
        )} ago`,
        active: true,
        exitButton: false,
        hoverable: true,
      }
    }
    case `SUCCESS`: {
      return {
        tooltipContent: (
          <BuildSuccessTooltipContent
            isOnPrettyUrl={isOnPrettyUrl}
            sitePrefix={sitePrefix}
            buildId={buildId}
            siteId={siteId}
            orgId={orgId}
          />
        ),
        active: true,
        showInfo: true,
        exitButton: true,
      }
    }
    case `ERROR`: {
      return {
        tooltipContent: (
          <BuildErrorTooltipContent
            siteId={siteId}
            orgId={orgId}
            buildId={erroredBuildId}
          />
        ),
        active: true,
        showInfo: true,
        exitButton: true,
      }
    }
    case `BUILDING`:
    default: {
      return {
        active: true,
      }
    }
  }
}

export default function InfoIndicatorButton(props) {
  const { orgId, siteId, buildId } = props
  const buttonProps = getButtonProps(props)
  const trackHover = () => {
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
      iconSvg={buttonProps?.showInfo ? infoIconActive : infoIcon}
      onClick={buttonProps?.active && trackHover}
      buttonIndex={props.buttonIndex}
      hoverable={false}
      {...buttonProps}
    />
  )
}
