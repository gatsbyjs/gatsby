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
        showInfo: false,
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
        hoverable: false,
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
        hoverable: false,
      }
    }
    case `BUILDING`: {
      return {
        tooltipContent: `Building a new preview`,
        showSpinner: true,
        overrideShowTooltip: true,
        showInfo: false,
        hoverable: true,
      }
    }
    default: {
      return {
        active: true,
        showInfo: false,
        hoverable: false,
      }
    }
  }
}

export default function InfoIndicatorButton(props) {
  const { orgId, siteId, buildId } = props
  const buttonProps = getButtonProps(props)
  const trackClick = () => {
    trackEvent({
      eventType: `PREVIEW_INDICATOR_CLICK`,
      orgId,
      siteId,
      buildId,
      name: `info click`,
    })
  }
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
      onClick={buttonProps?.active && trackClick}
      onMouseEnter={buttonProps?.active && trackHover}
      buttonIndex={props.buttonIndex}
      {...buttonProps}
    />
  )
}
