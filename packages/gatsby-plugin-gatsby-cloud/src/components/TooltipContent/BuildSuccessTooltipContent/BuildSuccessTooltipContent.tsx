import React, { FC, useContext } from "react"
import IndicatorContext from "../../../context/IndicatorContext"
import { EventType } from "../../../models/enums"
import { linkWrapperStyle, linkTextStyle } from "../tooltip-content.css"

const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms || 50))

const BuildSuccessTooltipContent: FC = () => {
  const { manifestInfo, buildInfo, isOnPrettyUrl, trackEvent } =
    useContext(IndicatorContext)

  const newPreviewAvailableClick = async (): Promise<void> => {
    trackEvent({
      eventType: EventType.PREVIEW_INDICATOR_CLICK,
      name: `new preview`,
    })

    /**
     * Delay to ensure that track event fires but do not await trackEvent directly since we do not
     * want to block the thread until the event request comes back
     */
    await delay(75)

    // Grabs domain that preview is hosted on https://preview-sitePrefix.gtsb.io
    // This will match `gtsb.io`
    const previewDomain = window.location.hostname
      .split(`.`)
      .slice(-2)
      .join(`.`)

    const isLocalhost = window.location.hostname === `localhost`

    if (manifestInfo?.redirectUrl) {
      window.location[isLocalhost ? `assign` : `replace`](
        manifestInfo?.redirectUrl
      )
    } else if (isOnPrettyUrl || isLocalhost) {
      window.location.reload()
    } else {
      window.location.replace(
        `https://preview-${buildInfo?.siteInfo?.sitePrefix}.${previewDomain}${window.location.pathname}`
      )
    }
  }

  return (
    <>
      {`This page has been updated.`}
      <button onClick={newPreviewAvailableClick} className={linkWrapperStyle}>
        <span className={linkTextStyle}>{`View Changes`}</span>
      </button>
    </>
  )
}

export default BuildSuccessTooltipContent
