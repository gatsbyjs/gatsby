import React, { useEffect, useState } from "react"
import { formatDistance } from "date-fns"
import { FeedbackTooltipContent } from "../tooltips"
import trackEvent from "../../utils/trackEvent"

import IndicatorButton from "./IndicatorButton"
import { infoIcon, infoAlertIcon } from "../icons"

export default function InfoIndicatorButton(props) {
  const { orgId, siteId, buildId, createdAt, buildStatus, askForFeedback } =
    props
  const [buttonProps, setButtonProps] = useState()

  const trackHover = () => {
    trackEvent({
      eventType: `PREVIEW_INDICATOR_HOVER`,
      orgId,
      siteId,
      buildId,
      name: `info hover`,
    })
  }

  useEffect(() => {
    const buildStatusActions = {
      [`UPTODATE`]: () => {
        if (askForFeedback) {
          setButtonProps({
            tooltipContent: <FeedbackTooltipContent />,
            active: true,
            overrideShowTooltip: true,
            highlighted: true,
            tooltipClosable: true,
            onTooltipCloseClick: () => {
              setButtonProps({ ...buildStatus, overrideShowTooltip: false })
            },
          })
        } else {
          setButtonProps({
            tooltipContent: `Preview updated ${formatDistance(
              Date.now(),
              new Date(createdAt),
              { includeSeconds: true }
            )} ago`,
            active: true,
          })
        }
      },
      [`SUCCESS`]: null,
      [`ERROR`]: null,
      [`BUILDING`]: null,
    }
    const buildStatusAction = buildStatusActions[buildStatus]
    if (buildStatusAction) {
      buildStatusAction()
    } else {
      setButtonProps({})
    }
  }, [props])

  return (
    <IndicatorButton
      testId="info"
      iconSvg={askForFeedback ? infoAlertIcon : infoIcon}
      onMouseEnter={buttonProps?.active && trackHover}
      buttonIndex={props.buttonIndex}
      hoverable={true}
      {...buttonProps}
    />
  )
}
