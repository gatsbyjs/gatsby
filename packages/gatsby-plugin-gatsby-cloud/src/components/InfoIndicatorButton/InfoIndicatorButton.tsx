import React, { FC, useContext, useEffect, useMemo, useState } from "react"
import { formatDistance } from "date-fns"
import IndicatorButton, { IIndicatorButtonProps } from "../IndicatorButton"
import { infoIcon, infoAlertIcon } from "../icons"
import {
  FeedbackTooltipContent,
  BuildErrorTooltipContent,
  BuildSuccessTooltipContent,
} from "../tooltips"
import {
  FEEDBACK_COOKIE_NAME,
  FEEDBACK_URL,
  INTERACTION_COOKIE_NAME,
} from "../../constants"
import { BuildStatus, EventType } from "../../models/enums"
import IndicatorContext from "../../context/IndicatorContext"

export interface IInfoIndicatorButtonProps {
  orgId: string
  siteId: string
  buildId: string
  erroredBuildId: string
  sitePrefix: string
  createdAt: string
  nodeManifestRedirectUrl: string
  nodeManifestErrorMessage: string
  isOnPrettyUrl: boolean
  usingContentSync: boolean
  buildStatus: BuildStatus
}

const InfoIndicatorButton: FC<IInfoIndicatorButtonProps> = ({
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
  const { setCookie, showFeedback, trackEvent } = useContext(IndicatorContext)
  const showAlertInfoIcon = useMemo(
    () =>
      showFeedback ||
      nodeManifestRedirectUrl ||
      nodeManifestErrorMessage ||
      // we only use build statuses to update UI state when not running content sync logic
      (!usingContentSync &&
        [BuildStatus.SUCCESS, BuildStatus.ERROR].includes(buildStatus)),
    []
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
      orgId,
      siteId,
      buildId,
      name: `info click`,
    })
  }

  const trackHoverEvent = (): void => {
    trackEvent({
      eventType: EventType.PREVIEW_INDICATOR_HOVER,
      orgId,
      siteId,
      buildId,
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
    setButtonProps(btnProps => {
      const newProps = { ...btnProps }
      if (newProps.tooltip) {
        newProps.tooltip.visible = !newProps.tooltip.visible
      }
      return newProps
    })
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
    // added setTimeout until revisit to refactor code
    setTimeout(() => {
      const now = new Date()
      setCookie(FEEDBACK_COOKIE_NAME, now.toISOString())
      setCookie(INTERACTION_COOKIE_NAME, `0`)
    }, 500)
  }

  useEffect(() => {
    const infoButtonProps: IIndicatorButtonProps = {
      ...baseButtonProps,
      onClick: trackClickEvent,
    }

    const prepareForMessage = (
      message: string,
      trigger: `none` | `hover` = `none`
    ): void => {
      if (infoButtonProps.tooltip) {
        infoButtonProps.tooltip.trigger = trigger
        infoButtonProps.tooltip.visible = trigger === `none`
        infoButtonProps.tooltip.content = message
      }
    }
    const dispatcher = {
      [BuildStatus.UP_TO_DATE]: (): void => {
        infoButtonProps.disabled = false
        if (showFeedback) {
          infoButtonProps.highlighted = true
          if (infoButtonProps.tooltip) {
            infoButtonProps.tooltip.trigger = `none`
            infoButtonProps.tooltip.visible = true
            infoButtonProps.tooltip.content = (
              <FeedbackTooltipContent
                url={FEEDBACK_URL}
                onOpened={closeFeedbackTooltip}
              />
            )
          }
        } else {
          const message = `Preview updated ${formatDistance(
            Date.now(),
            new Date(createdAt),
            { includeSeconds: true }
          )} ago`
          prepareForMessage(message, `hover`)
        }
      },
      [BuildStatus.SUCCESS]: (): void => {
        infoButtonProps.disabled = false
        infoButtonProps.onClick = toggleTooltip
        if (infoButtonProps.tooltip) {
          infoButtonProps.tooltip.visible = true
          infoButtonProps.tooltip.trigger = `click`
          infoButtonProps.tooltip.content = (
            <BuildSuccessTooltipContent
              isOnPrettyUrl={isOnPrettyUrl}
              sitePrefix={sitePrefix}
              buildId={buildId}
              siteId={siteId}
              orgId={orgId}
            />
          )
          infoButtonProps.tooltip.onClose = closeInfoTooltip
        }
      },
      [BuildStatus.ERROR]: (): void => {
        infoButtonProps.disabled = false
        infoButtonProps.onClick = toggleTooltip
        if (infoButtonProps.tooltip) {
          infoButtonProps.tooltip.visible = true
          infoButtonProps.tooltip.trigger = `click`
          infoButtonProps.tooltip.content = (
            <BuildErrorTooltipContent
              siteId={siteId}
              orgId={orgId}
              buildId={erroredBuildId}
            />
          )
          infoButtonProps.tooltip.onClose = closeInfoTooltip
        }
      },
      [BuildStatus.BUILDING]: (): void =>
        prepareForMessage(`Building your preview...`),
      [BuildStatus.QUEUED]: (): void =>
        prepareForMessage(`Kicking off your build...`),
      [BuildStatus.UPLOADING]: (): void => prepareForMessage(`Deploying...`),
    }

    if (nodeManifestRedirectUrl && infoButtonProps.tooltip) {
      infoButtonProps.onClick = toggleTooltip
      infoButtonProps.tooltip.content = (
        <BuildSuccessTooltipContent
          nodeManifestRedirectUrl={nodeManifestRedirectUrl}
        />
      )
      infoButtonProps.tooltip.visible = true
      infoButtonProps.tooltip.trigger = `click`
      infoButtonProps.tooltip.onClose = closeInfoTooltip
    }

    if (usingContentSync) {
      prepareForMessage(`Building a new preview`)
      infoButtonProps.showSpinner = true
    }

    // with the introduction of Content Sync eager redirects, button state is no longer tied to build status. So we need a separate action for Content Sync.
    if (!nodeManifestErrorMessage && !usingContentSync) {
      const runUpdates = dispatcher[buildStatus]
      runUpdates()
    }

    setButtonProps(infoButtonProps)
  }, [
    buildStatus,
    showFeedback,
    baseButtonProps,
    nodeManifestRedirectUrl,
    nodeManifestErrorMessage,
  ])

  return (
    <IndicatorButton
      {...buttonProps}
      onMouseEnter={!buttonProps?.disabled ? trackHoverEvent : undefined}
    />
  )
}

export default InfoIndicatorButton
