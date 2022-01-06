import React, { FC, useEffect, useState } from "react"
import { formatDistance } from "date-fns"
import IndicatorButton from "./IndicatorButton"
import { infoIcon, infoAlertIcon } from "../icons"
import { FeedbackTooltipContent } from "../tooltips"
import trackEvent from "../../utils/trackEvent"
import { BuildStatus } from "../../models/enums"
import {
  IBaseButtonProps,
  IIndicatorButtonProps,
} from "../../models/components"

interface IInfoIndicatorButtonProps extends IBaseButtonProps {
  askForFeedback?: boolean
}

const InfoIndicatorButton: FC<IInfoIndicatorButtonProps> = ({
  buttonIndex,
  orgId,
  siteId,
  buildId,
  createdAt,
  buildStatus,
  askForFeedback,
}) => {
  const [buttonProps, setButtonProps] = useState<IIndicatorButtonProps>({
    buttonIndex,
    testId: `info`,
    hoverable: true,
    iconSvg: askForFeedback ? infoAlertIcon : infoIcon,
  })

  const trackHover = (): void => {
    trackEvent({
      eventType: `PREVIEW_INDICATOR_HOVER`,
      orgId,
      siteId,
      buildId,
      name: `info hover`,
    })
  }

  const closeInfoTooltip = (): void => {
    setButtonProps({
      ...buttonProps,
      tooltip: { testId: buttonProps.testId, overrideShow: false, show: false },
    })
  }

  useEffect(() => {
    const buildStatusActions = {
      [BuildStatus.UPTODATE]: (): void => {
        if (askForFeedback) {
          const url = `https://gatsby.dev/zrx`
          setButtonProps({
            ...buttonProps,
            tooltip: {
              testId: buttonProps.testId,
              content: (
                <FeedbackTooltipContent
                  url={url}
                  onOpened={(): void => {
                    closeInfoTooltip()
                  }}
                />
              ),
              overrideShow: true,
              closable: true,
              onClose: closeInfoTooltip,
            },
            active: true,
            highlighted: true,
          })
        } else {
          setButtonProps({
            ...buttonProps,
            tooltip: {
              testId: buttonProps.testId,
              content: `Preview updated ${formatDistance(
                Date.now(),
                new Date(createdAt),
                { includeSeconds: true }
              )} ago`,
            },
            active: true,
          })
        }
      },
      [BuildStatus.SUCCESS]: null,
      [BuildStatus.ERROR]: null,
      [BuildStatus.BUILDING]: null,
    }
    const buildStatusAction = buildStatus
      ? buildStatusActions[buildStatus]
      : null
    if (buildStatusAction) {
      buildStatusAction()
    } else {
      setButtonProps({ ...buttonProps, active: false })
    }
  }, [askForFeedback, buildStatus])

  return (
    <IndicatorButton
      onMouseEnter={buttonProps?.active ? trackHover : undefined}
      {...buttonProps}
    />
  )
}

export default InfoIndicatorButton
