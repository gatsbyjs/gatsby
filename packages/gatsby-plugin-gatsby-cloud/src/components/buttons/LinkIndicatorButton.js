import React, { useState } from "react"
import trackEvent from "../../utils/trackEvent"
import IndicatorButton from "./IndicatorButton"
import { linkIcon, successIcon } from "../icons"

const copySuccessTooltip = (
  <>
    {successIcon}
    {`Link copied`}
  </>
)

const getButtonProps = ({ buildStatus }) => {
  switch (buildStatus) {
    case `BUILDING`:
    case `UPTODATE`:
      return {
        tooltipContent: `Copy link`,
        active: true,
      }
    case `SUCCESS`:
    case `ERROR`:
    default: {
      return {}
    }
  }
}

export default function LinkIndicatorButton(props) {
  const { orgId, siteId, buildId } = props
  const [linkButtonCopyProps, setLinkButtonCopyProps] = useState()

  const buttonProps = getButtonProps(props)

  const copyLinkClick = () => {
    trackEvent({
      eventType: `PREVIEW_INDICATOR_CLICK`,
      orgId,
      siteId,
      buildId,
      name: `copy link`,
    })

    setLinkButtonCopyProps({
      tooltipContent: copySuccessTooltip,
      overrideShowTooltip: true,
    })

    setTimeout(() => {
      setLinkButtonCopyProps({
        tooltipContent: copySuccessTooltip,
        overrideShowTooltip: false,
      })
      // We want the tooltip to linger for two seconds to let the user know it has been copied
    }, 2000)

    setTimeout(() => {
      setLinkButtonCopyProps({ tooltipContent: `Copy Link` })
      // The tooltips fade out, in order to make sure that the text does not change
      // while it is fading out we need to wait a bit longer than the time used above.
    }, 2400)

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

  return (
    <IndicatorButton
      testId={`link`}
      iconSvg={linkIcon}
      onClick={copyLinkClick}
      onMouseEnter={buttonProps?.active && trackHover}
      buttonIndex={props.buttonIndex}
      hoverable={true}
      {...buttonProps}
      {...linkButtonCopyProps}
    />
  )
}
