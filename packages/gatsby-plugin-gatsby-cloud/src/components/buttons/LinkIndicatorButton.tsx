import React, { FC, useEffect, useState } from "react"
import trackEvent from "../../utils/trackEvent"
import IndicatorButton from "./IndicatorButton"
import { linkIcon, successIcon } from "../icons"
import { BuildStatus } from "../../models/enums"
import {
  IBaseButtonProps,
  IIndicatorButtonProps,
} from "../../models/components"

const getBaseButtonProps = ({
  buttonIndex,
  buildStatus,
}: IBaseButtonProps): IIndicatorButtonProps => {
  const baseProps = {
    buttonIndex,
    testId: `link`,
    hoverable: true,
    iconSvg: linkIcon,
    tooltip: {
      onDisappear: (): void => {
        console.log(`MHMM`)
      },
    },
  }
  const activeProps = {
    ...baseProps,
    active: true,
    tooltip: {
      ...baseProps.tooltip,
      content: `Copy link`,
    },
  }
  const buildStatusProps = {
    [BuildStatus.UPTODATE]: activeProps,
    [BuildStatus.BUILDING]: activeProps,
    [BuildStatus.SUCCESS]: null,
    [BuildStatus.ERROR]: null,
  }
  const buttonProps = buildStatusProps[buildStatus]
  return buttonProps || baseProps
}

const copySuccessTooltip = (
  <>
    {successIcon}
    {`Link copied`}
  </>
)

const LinkIndicatorButton: FC<IBaseButtonProps> = props => {
  const { orgId, siteId, buildId } = props
  const [buttonProps, setButtonProps] = useState<IIndicatorButtonProps>(
    getBaseButtonProps(props)
  )

  const copyLinkClick = (): void => {
    trackEvent({
      eventType: `PREVIEW_INDICATOR_CLICK`,
      orgId,
      siteId,
      buildId,
      name: `copy link`,
    })

    console.log(buttonProps)

    setButtonProps({
      ...buttonProps,
      tooltip: {
        ...buttonProps.tooltip,
        content: copySuccessTooltip,
        overrideShow: true,
      },
    })

    setTimeout(() => {
      setButtonProps({
        ...buttonProps,
        tooltip: {
          ...buttonProps.tooltip,
          content: copySuccessTooltip,
          overrideShow: false,
        },
      })
      // We want the tooltip to linger for two seconds to let the user know it has been copied
    }, 2000)

    setTimeout(() => {
      setButtonProps({
        ...buttonProps,
        tooltip: { ...buttonProps.tooltip, content: `Copy Link` },
      })
      // The tooltips fade out, in order to make sure that the text does not change
      // while it is fading out we need to wait a bit longer than the time used above.
    }, 2400)

    if (window) {
      navigator.clipboard.writeText(window.location.href)
    }
  }

  const trackHover = (): void => {
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
    setButtonProps({
      ...baseButtonProps,
      onClick: copyLinkClick,
    })
  }, [props])

  return (
    <IndicatorButton
      onMouseEnter={buttonProps.active ? trackHover : undefined}
      {...buttonProps}
    />
  )
}

export default LinkIndicatorButton
