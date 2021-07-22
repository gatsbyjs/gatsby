import React from "react"
import { formatDistance } from "date-fns"

import { IndicatorButton } from "../buttons"
import trackEvent from "../../utils/trackEvent"
import { infoIcon } from "../icons"

const getButtonProps = props => {
  const { createdAt, buildStatus } = props
  switch (buildStatus) {
    case `UPTODATE`: {
      return {
        tooltipContent: `Preview updated ${formatDistance(
          Date.now(),
          new Date(createdAt),
          { includeSeconds: true }
        )} ago`,
        active: true,
      }
    }
    case `SUCCESS`:
    case `ERROR`:
    case `BUILDING`:
    default: {
      return {}
    }
  }
}

export function InfoIndicatorButton(props) {
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
      iconSvg={infoIcon}
      onMouseEnter={buttonProps?.active && trackHover}
      buttonIndex={props.buttonIndex}
      {...buttonProps}
    />
  )
}
