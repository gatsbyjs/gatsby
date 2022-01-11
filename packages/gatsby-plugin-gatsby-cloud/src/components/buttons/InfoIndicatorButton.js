import React, { useEffect, useCallback, useState, useRef } from "react"
import Cookies from "js-cookie"
import { formatDistance, differenceInDays } from "date-fns"
import IndicatorButton from "./IndicatorButton"
import { infoIcon, infoAlertIcon } from "../icons"
import {
  FeedbackTooltipContent,
  BuildErrorTooltipContent,
  BuildSuccessTooltipContent,
} from "../tooltips"
import trackEvent from "../../utils/trackEvent"
import { BuildStatus } from "../../models/enums"

const feedbackCookieName = `last_feedback`

const InfoIndicatorButton = ({
  buttonIndex,
  orgId,
  siteId,
  erroredBuildId,
  isOnPrettyUrl,
  sitePrefix,
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

  const closeInfoTooltip = () => {
    trackClick()
    setButtonProps(btnProps => {
      return {
        ...btnProps,
        tooltip: {
          ...btnProps.tooltip,
          show: false,
        },
      }
    })
  }

  const closeFeedbackTooltip = () => {
    const now = new Date()
    const rootDomain = location.hostname
      .split(`.`)
      .reverse()
      .splice(0, 2)
      .reverse()
      .join(`.`)
    Cookies.set(feedbackCookieName, now.toISOString(), {
      domain: rootDomain,
    })
    setButtonProps(btnProps => {
      return {
        ...btnProps,
        tooltip: {
          ...btnProps.tooltip,
          overrideShow: false,
          show: false,
        },
        highlighted: false,
      }
    })
    // remove the tooltip before updating the state to prevent flickering
    setTimeout(() => {
      askForFeedback.current = false
    }, 200)
  }

  useEffect(() => {
    checkForFeedback()
  }, [])

  useEffect(() => {
    console.log(buildStatus)
    const buildStatusActions = {
      [BuildStatus.UPTODATE]: () => {
        if (askForFeedback.current) {
          const url = `https://gatsby.dev/zrx`
          setButtonProps(btnProps => {
            return {
              ...btnProps,
              tooltip: {
                testId: btnProps.testId,
                content: (
                  <FeedbackTooltipContent
                    url={url}
                    onOpened={() => {
                      closeFeedbackTooltip()
                    }}
                  />
                ),
                overrideShow: true,
                closable: true,
                onClose: closeFeedbackTooltip,
              },
              active: true,
              highlighted: true,
            }
          })
        } else {
          setButtonProps(btnProps => {
            return {
              ...btnProps,
              tooltip: {
                testId: btnProps.testId,
                content: `Preview updated ${formatDistance(
                  Date.now(),
                  new Date(createdAt),
                  { includeSeconds: true }
                )} ago`,
                overrideShow: false,
                show: false,
              },
              active: true,
            }
          })
        }
      },
      [BuildStatus.SUCCESS]: () => {
        setButtonProps(btnProps => {
          return {
            ...btnProps,
            tooltip: {
              testId: btnProps.testId,
              content: (
                <BuildSuccessTooltipContent
                  isOnPrettyUrl={isOnPrettyUrl}
                  sitePrefix={sitePrefix}
                  buildId={buildId}
                  siteId={siteId}
                  orgId={orgId}
                />
              ),
              closable: true,
              onClose: closeInfoTooltip,
            },
            active: true,
            hoverable: true,
          }
        })
      },
      [BuildStatus.ERROR]: () => {
        setButtonProps(btnProps => {
          return {
            ...btnProps,
            tooltip: {
              testId: btnProps.testId,
              content: (
                <BuildErrorTooltipContent
                  siteId={siteId}
                  orgId={orgId}
                  buildId={erroredBuildId}
                />
              ),
              closable: true,
              onClose: closeInfoTooltip,
            },
            active: true,
            hoverable: true,
          }
        })
      },
      [BuildStatus.BUILDING]: () => {
        setButtonProps(btnProps => {
          return {
            ...btnProps,
            tooltip: {
              testId: btnProps.testId,
              content: `Building a new preview`,
              overrideShow: true,
            },
            active: false,
            hoverable: true,
            showSpinner: true,
          }
        })
      },
    }
    const buildStatusAction = buildStatus
      ? buildStatusActions[buildStatus]
      : null
    if (buildStatusAction) {
      buildStatusAction()
    } else {
      setButtonProps({ ...buttonProps, active: true, hoverable: true })
    }
  }, [askForFeedback.current, buildStatus])

  return (
    <IndicatorButton
      {...buttonProps}
      onClick={buttonProps?.active ? trackClick : undefined}
      onMouseEnter={buttonProps?.active ? trackHover : undefined}
      iconSvg={askForFeedback.current ? infoAlertIcon : infoIcon}
    />
  )
}

export default InfoIndicatorButton
