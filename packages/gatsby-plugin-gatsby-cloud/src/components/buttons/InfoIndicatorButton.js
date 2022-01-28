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
  nodeManifestRedirectUrl,
  usingContentSync,
  nodeManifestErrorMessage,
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
        if (shouldShowFeedback) {
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
          onClick: onTooltipToogle,
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
    }

    // this is because the build status enum is used for ui state - so we can't have 1 ui state that covers multiple build statuses.
    // If we don't have content sync info (pollForNodeManifest), we have to assume that a currently building build isn't applicable to the current user. So we default to the least noisy state which is UPTODATE.
    // @todo refactor and decouple build states from UI states - this state should be something like uiState === `IDLE`
    buildStatusActions[BuildStatus.BUILDING] =
      buildStatusActions[BuildStatus.UPTODATE]

    const contentSyncSuccessAction = nodeManifestRedirectUrl
      ? () => {
          setButtonProps(btnProps => {
            return {
              ...btnProps,
              tooltip: {
                testId: btnProps.testId,
                content: (
                  <BuildSuccessTooltipContent
                    nodeManifestRedirectUrl={nodeManifestRedirectUrl}
                  />
                ),
                closable: true,
                onClose: closeInfoTooltip,
              },
              active: true,
              hoverable: true,
              showSpinner: false,
              onClick: onTooltipToogle,
            }
          })
        }
      : false

    const contentSyncLoadingAction = usingContentSync
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
      : false

    const contentSyncErrorAction = nodeManifestErrorMessage
      ? buildStatusActions[BuildStatus.ERROR]
      : false

    const contentSyncAction =
      contentSyncSuccessAction ||
      contentSyncErrorAction ||
      contentSyncLoadingAction

    const buildStatusAction =
      // with the introduction of Content Sync eager redirects, button state is no longer tied to build status. So we need a separate action for Content Sync.
      contentSyncAction || buildStatusActions[buildStatus]

    if (typeof buildStatusAction === `function`) {
      buildStatusAction()
    } else {
      setButtonProps({ ...buttonProps, active: true, hoverable: true })
    }
  }, [
    buildStatus,
    shouldShowFeedback,
    nodeManifestRedirectUrl,
    nodeManifestErrorMessage,
  ])

  const showNotificationInfoIcon =
    shouldShowFeedback ||
    nodeManifestRedirectUrl ||
    nodeManifestErrorMessage ||
    // we only use build statuses to update UI state when not running content sync logic
    (!usingContentSync &&
      [BuildStatus.SUCCESS, BuildStatus.ERROR].includes(buildStatus))

  return (
    <IndicatorButton
      {...buttonProps}
      onClick={onInfoClick}
      onMouseEnter={buttonProps?.active ? trackHover : undefined}
      onTooltipToogle={updateTootipVisibility}
      iconSvg={showNotificationInfoIcon ? infoAlertIcon : infoIcon}
    />
  )
}

export default InfoIndicatorButton
