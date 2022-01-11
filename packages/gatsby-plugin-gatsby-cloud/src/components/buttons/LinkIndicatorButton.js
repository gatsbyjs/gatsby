import React, { useEffect, useState } from "react"
import trackEvent from "../../utils/trackEvent"
import IndicatorButton from "./IndicatorButton"
import { linkIcon, successIcon } from "../icons"
import { BuildStatus } from "../../models/enums"

const getBaseButtonProps = ({ buttonIndex, buildStatus }) => {
  const baseProps = {
    buttonIndex,
    testId: `link`,
    hoverable: true,
    iconSvg: linkIcon,
  }
  const activeProps = {
    active: true,
    tooltip: {
      testId: baseProps.testId,
      content: `Copy link`,
    },
  }
  const buildStatusProps = {
    [BuildStatus.UPTODATE]: activeProps,
    [BuildStatus.BUILDING]: activeProps,
    [BuildStatus.SUCCESS]: null,
    [BuildStatus.ERROR]: null,
  }
  const props = buildStatus ? buildStatusProps[buildStatus] : null
  if (props) {
    return { ...baseProps, ...props }
  }
  return baseProps
}

const copySuccessTooltip = (
  <>
    {successIcon}
    {`Link copied`}
  </>
)

const LinkIndicatorButton = props => {
  const { orgId, siteId, buildId, buttonIndex } = props
  const [buttonProps, setButtonProps] = useState({
    buttonIndex,
    testId: `link`,
    hoverable: true,
    iconSvg: linkIcon,
  })

  const copyLinkClick = () => {
    trackEvent({
      eventType: `PREVIEW_INDICATOR_CLICK`,
      orgId,
      siteId,
      buildId,
      name: `copy link`,
    })

    setButtonProps(btnProps => {
      return {
        ...btnProps,
        tooltip: {
          ...buttonProps.tooltip,
          content: copySuccessTooltip,
          overrideShow: true,
        },
        hoverable: false,
      }
    })

    setTimeout(() => {
      setButtonProps(btnProps => {
        return {
          ...btnProps,
          tooltip: {
            ...btnProps.tooltip,
            overrideShow: false,
            show: false,
          },
          hoverable: true,
        }
      })
      // We want the tooltip to linger for two seconds to let the user know it has been copied
    }, 2000)

    if (window) {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const trackHover = () => {
    trackEvent({
      eventType: `PREVIEW_INDICATOR_HOVER`,
      orgId,
      siteId,
      buildId,
      name: `link hover`,
    })
  }

  useEffect(() => {
    const baseButtonProps = getBaseButtonProps(props)
    const onDisappear = () => {
      setButtonProps(btnProps => {
        return {
          ...btnProps,
          tooltip: { ...buttonProps.tooltip, content: `Copy link` },
        }
      })
    }
    setButtonProps(btnProps => {
      return {
        ...btnProps,
        ...baseButtonProps,
        onClick: copyLinkClick,
        tooltip: {
          ...baseButtonProps.tooltip,
          onDisappear,
        },
      }
    })
  }, [props.buildStatus])

  return (
    <IndicatorButton
      onMouseEnter={buttonProps.active ? trackHover : undefined}
      {...buttonProps}
    />
  )
}

export default LinkIndicatorButton
