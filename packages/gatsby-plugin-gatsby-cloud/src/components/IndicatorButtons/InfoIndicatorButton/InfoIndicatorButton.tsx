import React, { FC, useContext, useEffect, useMemo, useState } from "react"
import { formatDistance } from "date-fns"
import IndicatorButton, { IIndicatorButtonProps } from "../IndicatorButton"
import { infoIcon, infoAlertIcon } from "../../icons"
import {
  FeedbackTooltipContent,
  BuildErrorTooltipContent,
  BuildSuccessTooltipContent,
} from "../../TooltipContent"
import {
  FEEDBACK_COOKIE_NAME,
  FEEDBACK_URL,
  INTERACTION_COOKIE_NAME,
} from "../../../constants"
import { BuildStatus, EventType } from "../../../models/enums"
import IndicatorContext from "../../../context/IndicatorContext"

const InfoIndicatorButton: FC = () => {
  const {
    showFeedback,
    usingContentSync,
    currentBuildStatus,
    manifestInfo,
    buildInfo,
    setCookie,
    trackEvent,
  } = useContext(IndicatorContext)
  const showAlertInfoIcon = useMemo(
    () =>
      showFeedback ||
      manifestInfo?.redirectUrl ||
      manifestInfo?.errorMessage ||
      // we only use build statuses to update UI state when not running content sync logic
      (!usingContentSync &&
        currentBuildStatus &&
        [BuildStatus.SUCCESS, BuildStatus.ERROR].includes(currentBuildStatus)),
    [currentBuildStatus, showFeedback, manifestInfo]
  )
  const baseButtonProps: IIndicatorButtonProps = useMemo(() => {
    return {
      testId: `info`,
      icon: showAlertInfoIcon ? infoAlertIcon : infoIcon,
      disabled: false,
      showSpinner: false,
      tooltip: {
        content: ``,
        trigger: `hover`,
      },
    }
  }, [showAlertInfoIcon])
  const [buttonProps, setButtonProps] =
    useState<IIndicatorButtonProps>(baseButtonProps)

  const trackClickEvent = (): void => {
    trackEvent({
      eventType: EventType.PREVIEW_INDICATOR_CLICK,
      name: `info click`,
    })
  }

  const trackHoverEvent = (): void => {
    trackEvent({
      eventType: EventType.PREVIEW_INDICATOR_HOVER,
      name: `info hover`,
    })
  }

  const updateTooltipVisibility = (visible: boolean): void => {
    setButtonProps(btnProps => {
      const newProps = { ...btnProps }
      if (newProps.tooltip) {
        newProps.tooltip.visible = visible
      }
      return newProps
    })
  }

  const closeInfoTooltip = (): void => {
    trackClickEvent()
    updateTooltipVisibility(false)
  }

  const toggleTooltip = (): void => {
    trackClickEvent()
    updateTooltipVisibility(!buttonProps.tooltip?.visible)
  }

  const resetFeedbackLoop = (): void => {
    const now = new Date()
    setCookie(FEEDBACK_COOKIE_NAME, now.toISOString())
    setCookie(INTERACTION_COOKIE_NAME, `0`)
  }

  const closeFeedbackTooltip = (): void => {
    setButtonProps(btnProps => {
      const newProps = { ...btnProps }
      newProps.highlighted = false
      if (newProps.tooltip) {
        newProps.tooltip.visible = false
      }
      return newProps
    })

    setTimeout(resetFeedbackLoop, 500)
  }

  useEffect(() => {
    const infoButtonProps: IIndicatorButtonProps = {
      ...baseButtonProps,
      onClick: trackClickEvent,
    }

    const prepareForMessage = (
      message: string,
      trigger: `none` | `hover` = `none`,
      showSpinner: boolean = true
    ): void => {
      infoButtonProps.showSpinner = showSpinner
      if (showSpinner) {
        infoButtonProps.clickable = !showSpinner
      }
      if (infoButtonProps.tooltip) {
        infoButtonProps.tooltip.trigger = trigger
        infoButtonProps.tooltip.visible = trigger === `none`
        infoButtonProps.tooltip.content = message
      }
    }
    const dispatcher: { [key: string]: () => void } = {
      [BuildStatus.UP_TO_DATE]: (): void => {
        infoButtonProps.disabled = false
        if (showFeedback) {
          infoButtonProps.highlighted = true
          if (infoButtonProps.tooltip) {
            infoButtonProps.tooltip.trigger = `manual`
            infoButtonProps.tooltip.visible = true
            infoButtonProps.tooltip.content = (
              <FeedbackTooltipContent
                url={FEEDBACK_URL}
                onURLOpened={closeFeedbackTooltip}
              />
            )
            infoButtonProps.tooltip.onClose = closeFeedbackTooltip
          }
        } else {
          if (buildInfo?.currentBuild?.createdAt) {
            const message = `Preview updated ${formatDistance(
              Date.now(),
              new Date(buildInfo.currentBuild.createdAt),
              {
                includeSeconds: true,
              }
            )} ago`
            prepareForMessage(message, `hover`, false)
          }
        }
      },
      [BuildStatus.SUCCESS]: (): void => {
        infoButtonProps.disabled = false
        infoButtonProps.onClick = toggleTooltip
        if (infoButtonProps.tooltip) {
          infoButtonProps.tooltip.visible = true
          infoButtonProps.tooltip.trigger = `click`
          infoButtonProps.tooltip.content = <BuildSuccessTooltipContent />
          infoButtonProps.tooltip.onClose = closeInfoTooltip
        }
      },
      [BuildStatus.ERROR]: (): void => {
        infoButtonProps.disabled = false
        infoButtonProps.onClick = toggleTooltip
        if (infoButtonProps.tooltip) {
          infoButtonProps.tooltip.visible = true
          infoButtonProps.tooltip.trigger = `manual`
          infoButtonProps.tooltip.content = <BuildErrorTooltipContent />
          infoButtonProps.tooltip.onClose = closeInfoTooltip
        }
      },
      [BuildStatus.BUILDING]: (): void =>
        prepareForMessage(`Building your preview...`),
      [BuildStatus.QUEUED]: (): void =>
        prepareForMessage(`Kicking off your build...`),
      [BuildStatus.UPLOADING]: (): void => prepareForMessage(`Deploying...`),
    }

    if (manifestInfo?.redirectUrl && infoButtonProps.tooltip) {
      infoButtonProps.onClick = toggleTooltip
      infoButtonProps.tooltip.content = <BuildSuccessTooltipContent />
      infoButtonProps.tooltip.visible = true
      infoButtonProps.tooltip.trigger = `click`
      infoButtonProps.tooltip.onClose = closeInfoTooltip
    }

    if (usingContentSync) {
      prepareForMessage(`Building a new preview`)
      infoButtonProps.showSpinner = true
    }

    // with the introduction of Content Sync eager redirects, button state is no longer tied to build status. So we need a separate action for Content Sync.
    if (
      !manifestInfo?.errorMessage &&
      !usingContentSync &&
      currentBuildStatus
    ) {
      const runUpdates = dispatcher[currentBuildStatus]
      runUpdates()
    }

    setButtonProps(infoButtonProps)
  }, [currentBuildStatus, showFeedback, baseButtonProps, manifestInfo])

  return (
    <IndicatorButton
      {...buttonProps}
      onMouseEnter={!buttonProps?.disabled ? trackHoverEvent : undefined}
    />
  )
}

export default InfoIndicatorButton
