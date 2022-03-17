import React, { FC, useContext, useEffect, useMemo, useState } from "react"
import IndicatorButton, { IIndicatorButtonProps } from "../IndicatorButton"
import { linkIcon, successIcon } from "../icons"
import { BuildStatus, EventType } from "../../models/enums"
import IndicatorContext from "../../context/IndicatorContext"

const CopySuccessTooltipContent = (
  <>
    {successIcon}
    {`Link copied`}
  </>
)

export interface ILinkIndicatorButtonProps {
  orgId: string
  siteId: string
  buildId: string
  buildStatus: BuildStatus
}

const LinkIndicatorButton: FC<ILinkIndicatorButtonProps> = ({
  orgId,
  siteId,
  buildId,
  buildStatus,
}) => {
  const { trackEvent } = useContext(IndicatorContext)
  const baseButtonProps = useMemo(() => {
    const props: IIndicatorButtonProps = {
      icon: linkIcon,
      testId: `link`,
    }
    if (
      buildStatus === BuildStatus.BUILDING ||
      buildStatus === BuildStatus.UP_TO_DATE
    ) {
      props.disabled = false
      props.tooltip = {
        content: `Copy link`,
        trigger: `hover`,
      }
    }
    return props
  }, [buildStatus])
  const [buttonProps, setButtonProps] =
    useState<IIndicatorButtonProps>(baseButtonProps)

  const onCopyLinkClick = (): void => {
    trackEvent({
      eventType: EventType.PREVIEW_INDICATOR_CLICK,
      orgId,
      siteId,
      buildId,
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
      orgId,
      siteId,
      buildId,
      name: `link hover`,
    })
  }

  useEffect(() => {
    const onTooltipClose = (): void => {
      setButtonProps(btnProps => {
        const newProps = { ...buttonProps, ...btnProps }
        if (newProps.tooltip) {
          newProps.tooltip.content = `Copy link`
          newProps.tooltip.trigger = `hover`
        }
        return newProps
      })
    }
    setButtonProps(btnProps => {
      const newProps = { ...buttonProps, ...btnProps }
      newProps.onClick = onCopyLinkClick
      if (newProps.tooltip) {
        newProps.tooltip.onClose = onTooltipClose
      }
      return newProps
    })
  }, [buildStatus])

  return (
    <IndicatorButton
      onMouseEnter={!buttonProps.disabled ? onMouseEnter : undefined}
      {...buttonProps}
    />
  )
}

export default LinkIndicatorButton
