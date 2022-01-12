import React, { useEffect, useCallback, useState, useRef, useMemo } from "react"
import { formatDistance, differenceInDays } from "date-fns"
import IndicatorButton from "./IndicatorButton"
import { infoIcon, infoAlertIcon } from "../icons"
import {
  FeedbackTooltipContent,
  BuildErrorTooltipContent,
  BuildSuccessTooltipContent,
} from "../tooltips"
import { useTrackEvent, useCookie } from "../../utils"
import {
  feedbackCookieName,
  interactionCountCookieName,
} from "../../constants/cookie"
import { BuildStatus } from "../../models/enums"

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
  const { cookies, setCookie, getCookie } = useCookie()
  const { track } = useTrackEvent()
  const shouldShowFeedback = useMemo(() => {
    const interactionCount = cookies[interactionCountCookieName]
      ? parseInt(cookies[interactionCountCookieName])
      : 0
    return askForFeedback.current && interactionCount > 3
  }, [askForFeedback.current, cookies[interactionCountCookieName]])

  const checkForFeedback = useCallback(() => {
    const lastFeedback = getCookie(feedbackCookieName)
    if (lastFeedback) {
      const lastFeedbackDate = new Date(lastFeedback)
      const now = new Date()
      const diffInDays = differenceInDays(now, lastFeedbackDate)
      askForFeedback.current = diffInDays >= 30
    } else {
      askForFeedback.current = true
    }
  }, [])

  const trackClick = () => {
    track({
      eventType: `PREVIEW_INDICATOR_CLICK`,
      orgId,
      siteId,
      buildId,
      name: `info click`,
    })
  }

  const trackHover = () => {
    track({
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
    setCookie(feedbackCookieName, now.toISOString(), {
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
    console.log(cookies[interactionCountCookieName])
  }, [cookies.interaction_count])

  useEffect(() => {
    const buildStatusActions = {
      [BuildStatus.UPTODATE]: () => {
        if (shouldShowFeedback) {
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
  }, [shouldShowFeedback, buildStatus])

  return (
    <IndicatorButton
      {...buttonProps}
      onClick={buttonProps?.active ? trackClick : undefined}
      onMouseEnter={buttonProps?.active ? trackHover : undefined}
      iconSvg={shouldShowFeedback ? infoAlertIcon : infoIcon}
    />
  )
}

export default InfoIndicatorButton
