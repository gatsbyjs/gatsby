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
import {
  FEEDBACK_COOKIE_NAME,
  FEEDBACK_URL,
  INTERACTION_COOKIE_NAME,
} from "../../constants"
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
  const initialButtonProps = { buttonIndex, testId: `info`, hoverable: true }
  const [buttonProps, setButtonProps] = useState(initialButtonProps)
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

  const updateTootipVisibility = visible => {
    setButtonProps(btnProps => {
      return {
        ...btnProps,
        tooltip: {
          ...btnProps.tooltip,
          show: visible,
        },
      }
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
          overrideShow: false,
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
    // setTimeout(() => {
    //   const now = new Date()
    //   setCookie(FEEDBACK_COOKIE_NAME, now.toISOString())
    //   setCookie(INTERACTION_COOKIE_NAME, 0)
    // }, 500)
  }

  const onFeedbackTooltipDisappear = () => {
    const now = new Date()
    setCookie(FEEDBACK_COOKIE_NAME, now.toISOString())
    setCookie(INTERACTION_COOKIE_NAME, 0)
  }

  useEffect(() => {
    const buildStatusActions = {
      [BuildStatus.UPTODATE]: () => {
        if (shouldShowFeedback && buildStatus === BuildStatus.UPTODATE) {
          const url = FEEDBACK_URL
          setButtonProps({
            ...initialButtonProps,
            tooltip: {
              testId: initialButtonProps.testId,
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

    const buildStatusAction = buildStatusActions[buildStatus]
    if (typeof buildStatusAction === `function`) {
      buildStatusAction()
    } else {
      setButtonProps({ ...buttonProps, active: true, hoverable: true })
    }
  }, [buildStatus, shouldShowFeedback])

  return (
    <IndicatorButton
      {...buttonProps}
      onClick={buttonProps?.active ? trackClick : undefined}
      onMouseEnter={buttonProps?.active ? trackHover : undefined}
      onTooltipToogle={updateTootipVisibility}
      iconSvg={shouldShowFeedback ? infoAlertIcon : infoIcon}
    />
  )
}

export default InfoIndicatorButton
