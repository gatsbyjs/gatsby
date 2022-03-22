import React, { FC, useContext, useEffect, useState } from "react"
import IndicatorButton, { IIndicatorButtonProps } from "../IndicatorButton"
import { linkIcon, successIcon } from "../../icons"
import { BuildStatus, EventType } from "../../../models/enums"
import IndicatorContext from "../../../context/IndicatorContext"

const CopySuccessTooltipContent = (
  <>
    {successIcon}
    {`Link copied`}
  </>
)

const LinkIndicatorButton: FC = () => {
  const { currentBuildStatus, trackEvent } = useContext(IndicatorContext)
  const baseButtonProps: IIndicatorButtonProps = {
    icon: linkIcon,
    testId: `link`,
    clickable: false,
    disabled: true,
  }
  const [buttonProps, setButtonProps] =
    useState<IIndicatorButtonProps>(baseButtonProps)

  const onCopyLinkClick = (): void => {
    trackEvent({
      eventType: EventType.PREVIEW_INDICATOR_CLICK,
      name: `copy link`,
    })

    setButtonProps(btnProps => {
      const newProps = { ...btnProps }
      if (newProps.tooltip) {
        newProps.tooltip.content = CopySuccessTooltipContent
        newProps.tooltip.visible = true
        newProps.tooltip.trigger = `none`
      }
      return newProps
    })

    setTimeout(() => {
      setButtonProps(btnProps => {
        const newProps = { ...btnProps }
        if (newProps.tooltip) {
          newProps.tooltip.visible = false
          newProps.tooltip.trigger = `hover`
        }
        return newProps
      })
      // We want the tooltip to linger for two seconds to let the user know it has been copied
    }, 2000)

    if (window) {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const onMouseEnter = (): void => {
    trackEvent({
      eventType: EventType.PREVIEW_INDICATOR_HOVER,
      name: `link hover`,
    })
  }

  useEffect(() => {
    if (
      currentBuildStatus === BuildStatus.BUILDING ||
      currentBuildStatus === BuildStatus.UP_TO_DATE
    ) {
      const onTooltipClose = (): void => {
        setButtonProps(btnProps => {
          const newProps = { ...btnProps }
          if (newProps.tooltip) {
            newProps.tooltip.content = `Copy link`
            newProps.tooltip.trigger = `hover`
          }
          return newProps
        })
      }

      setButtonProps(btnProps => {
        const newProps = { ...btnProps, ...baseButtonProps }
        newProps.disabled = false
        newProps.clickable = true
        newProps.disabled = false
        newProps.onClick = onCopyLinkClick
        newProps.tooltip = {
          content: `Copy link`,
          trigger: `hover`,
          onDisappear: onTooltipClose,
        }
        return newProps
      })
    } else {
      setButtonProps(baseButtonProps)
    }
  }, [currentBuildStatus])

  return (
    <IndicatorButton
      onMouseEnter={!buttonProps.disabled ? onMouseEnter : undefined}
      {...buttonProps}
    />
  )
}

export default LinkIndicatorButton
