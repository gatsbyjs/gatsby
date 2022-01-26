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
import { useMemo } from "react"

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
  contentSyncRedirectUrl,
  contentSyncInfo,
}) => {
  const initialButtonProps = { buttonIndex, testId: `info`, hoverable: true }
  const [buttonProps, setButtonProps] = useState(initialButtonProps)
  const { setCookie } = useCookie()
  const { shouldShowFeedback } = useFeedback()
  const { track } = useTrackEvent()

  const showNotificationInfoIcon = useMemo(
    () =>
      shouldShowFeedback ||
      [BuildStatus.SUCCESS, BuildStatus.ERROR].includes(buildStatus),
    [shouldShowFeedback, buildStatus]
  )

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
          hoverable: false,
        },
      }
    })
  }

  const onTooltipToogle = () => {
    trackClick()
    setButtonProps(btnProps => {
      return {
        ...btnProps,
        tooltip: {
          ...btnProps.tooltip,
          overrideShow: !btnProps.tooltip.overrideShow,
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
    // added settimeout until reveist to refactor code
    setTimeout(() => {
      const now = new Date()
      setCookie(FEEDBACK_COOKIE_NAME, now.toISOString())
      setCookie(INTERACTION_COOKIE_NAME, 0)
    }, 500)
  }

  const onInfoClick = () => {
    if (buttonProps?.active && buttonProps?.onClick) {
      buttonProps.onClick()
    } else if (buttonProps?.active) {
      trackClick()
    }
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
              hoverable: false,
              onClose: closeFeedbackTooltip,
            },
            active: true,
            highlighted: true,
            hoverable: true,
          })
        } else {
          setButtonProps({
            ...initialButtonProps,
            tooltip: {
              testId: initialButtonProps.testId,
              content: `Preview updated ${formatDistance(
                Date.now(),
                new Date(createdAt),
                { includeSeconds: true }
              )} ago`,
              overrideShow: false,
              show: false,
              hoverable: true,
            },
            active: true,
            hoverable: true,
          })
        }
      },
      [BuildStatus.SUCCESS]: () => {
        setButtonProps({
          ...initialButtonProps,
          tooltip: {
            testId: initialButtonProps.testId,
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
            hoverable: false,
            onClose: closeInfoTooltip,
          },
          active: true,
          hoverable: true,
          onClose: closeInfoTooltip,
        })
      },
      [BuildStatus.ERROR]: () => {
        setButtonProps({
          ...initialButtonProps,
          tooltip: {
            testId: initialButtonProps.testId,
            content: (
              <BuildErrorTooltipContent
                siteId={siteId}
                orgId={orgId}
                buildId={erroredBuildId}
              />
            ),
            overrideShow: true,
            closable: true,
            hoverable: false,
            onClose: closeInfoTooltip,
          },
          active: true,
          hoverable: true,
          onClick: onTooltipToogle,
        })
      },
      [BuildStatus.BUILDING]: () => {
        setButtonProps({
          ...initialButtonProps,
          tooltip: {
            testId: initialButtonProps.testId,
            content: `Building a new preview`,
            overrideShow: true,
            hoverable: false,
          },
          active: true,
          hoverable: false,
          showSpinner: true,
        })
      },
    }

    const contentSyncAction =
      // if there's a redirect url we show that
      contentSyncRedirectUrl
        ? () => {
            setButtonProps(btnProps => {
              return {
                ...btnProps,
                tooltip: {
                  testId: btnProps.testId,
                  content: (
                    <BuildSuccessTooltipContent
                      contentSyncRedirectUrl={contentSyncRedirectUrl}
                    />
                  ),
                  closable: true,
                  onClose: closeInfoTooltip,
                },
                active: true,
                hoverable: true,
                showSpinner: false,
              }
            })
          }
        : // otherwise if we're running content sync logic, show the loading state
        contentSyncInfo
        ? () => {
            setButtonProps(btnProps => {
              return {
                ...btnProps,
                tooltip: {
                  testId: btnProps.testId,
                  content: `Building a new preview`,
                  overrideShow: true,
                },
                active: true,
                hoverable: true,
                showSpinner: true,
              }
            })
          }
        : // otherwise we're not running content sync logic here
          null

    const buildStatusAction =
      // with the introduction of Content Sync eager redirects, button state is no longer tied to build status. So we need a separate action for Content Sync.
      contentSyncAction || buildStatusActions[buildStatus]

    if (typeof buildStatusAction === `function`) {
      buildStatusAction()
    } else {
      setButtonProps({ ...buttonProps, active: true, hoverable: true })
    }
  }, [buildStatus, shouldShowFeedback, contentSyncRedirectUrl])

  return (
    <IndicatorButton
      {...buttonProps}
      onClick={onInfoClick}
      onMouseEnter={buttonProps?.active ? trackHover : undefined}
      onTooltipToogle={updateTootipVisibility}
      iconSvg={
        showNotificationInfoIcon || contentSyncRedirectUrl
          ? infoAlertIcon
          : infoIcon
      }
    />
  )
}

export default InfoIndicatorButton
