import React, { useEffect, useCallback, useState, useRef } from "react"
import Cookies from "js-cookie"
import { formatDistance, differenceInDays } from "date-fns"
import IndicatorButton from "./IndicatorButton"
import { infoIcon, infoAlertIcon } from "../icons"
import { FeedbackTooltipContent } from "../tooltips"
import trackEvent from "../../utils/trackEvent"
import { BuildStatus } from "../../models/enums"

const feedbackCookieName = `last_feedback`

const InfoIndicatorButton = ({
  buttonIndex,
  orgId,
  siteId,
  buildId,
  createdAt,
  buildStatus,
}) => {
  const askForFeedback = useRef(false)
  const [buttonProps, setButtonProps] = useState({
    buttonIndex,
    testId: `info`,
    hoverable: true,
  })

  const checkForFeedback = useCallback(() => {
    const lastFeedback = Cookies.get(feedbackCookieName)
    if (lastFeedback) {
      const lastFeedbackDate = new Date(lastFeedback)
      console.log(lastFeedbackDate)
      const now = new Date()
      const diffInDays = differenceInDays(now, lastFeedbackDate)
      askForFeedback.current = diffInDays >= 30
    } else {
      askForFeedback.current = true
    }
  }, [])

  const trackHover = () => {
    trackEvent({
      eventType: `PREVIEW_INDICATOR_HOVER`,
      orgId,
      siteId,
      buildId,
      name: `info hover`,
    })
  }

  const closeInfoTooltip = () => {
    const now = new Date()
    Cookies.set(feedbackCookieName, now.toISOString())
    askForFeedback.current = false
    setButtonProps({
      ...buttonProps,
      tooltip: { testId: buttonProps.testId, overrideShow: false, show: false },
    })
  }

  useEffect(() => {
    checkForFeedback()
  }, [])

  useEffect(() => {
    const buildStatusActions = {
      [BuildStatus.UPTODATE]: () => {
        if (askForFeedback.current) {
          const url = `https://gatsby.dev/zrx`
          setButtonProps({
            ...buttonProps,
            tooltip: {
              testId: buttonProps.testId,
              content: (
                <FeedbackTooltipContent
                  url={url}
                  onOpened={() => {
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
  }, [askForFeedback.current, buildStatus])

  return (
    <IndicatorButton
      onMouseEnter={buttonProps?.active ? trackHover : undefined}
      iconSvg={askForFeedback.current ? infoAlertIcon : infoIcon}
      {...buttonProps}
    />
  )
}

export default InfoIndicatorButton
