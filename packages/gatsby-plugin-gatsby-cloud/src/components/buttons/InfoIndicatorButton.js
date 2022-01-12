import React, { useEffect, useState } from "react"
import { formatDistance } from "date-fns"
import IndicatorButton from "./IndicatorButton"
import { infoIcon, infoAlertIcon } from "../icons"
import {
  FeedbackTooltipContent,
  BuildErrorTooltipContent,
  BuildSuccessTooltipContent,
} from "../tooltips"
import { useTrackEvent, useCookie, useFeedback } from "../../utils"
import { FEEDBACK_COOKIE_NAME, INTERACTION_COOKIE_NAME } from "../../constants"
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
  const [buttonProps, setButtonProps] = useState({
    buttonIndex,
    testId: `info`,
    hoverable: true,
  })
  const { setCookie } = useCookie()
  const { shouldShowFeedback } = useFeedback()
  const { track } = useTrackEvent()

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
  }

  const onFeedbackTooltipDisappear = () => {
    console.log(`yahs`)
    const now = new Date()
    setCookie(FEEDBACK_COOKIE_NAME, now.toISOString())
    setCookie(INTERACTION_COOKIE_NAME, 0)
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
  }

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
                onDisappear: onFeedbackTooltipDisappear,
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
