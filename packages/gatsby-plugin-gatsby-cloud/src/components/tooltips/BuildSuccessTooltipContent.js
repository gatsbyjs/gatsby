import React from "react"
import trackEvent from "../../utils/trackEvent"

const delay = ms => new Promise(resolve => setTimeout(resolve, ms || 50))

const newPreviewAvailableClick = async ({
  isOnPrettyUrl,
  sitePrefix,
  orgId,
  siteId,
  buildId,
}) => {
  trackEvent({
    eventType: `PREVIEW_INDICATOR_CLICK`,
    orgId,
    siteId,
    buildId,
    name: `new preview`,
  })

  /**
   * Delay to ensure that track event fires but do not await trackEvent directly since we do not
   * want to block the thread until the event request comes back
   */
  await delay(75)

  // Grabs domain that preview is hosted on https://preview-sitePrefix.gtsb.io
  // This will match `gtsb.io`
  const previewDomain = window.location.hostname.split(`.`).slice(-2).join(`.`)

  if (isOnPrettyUrl || window.location.hostname === `localhost`) {
    window.location.reload()
  } else {
    window.location.replace(
      `https://preview-${sitePrefix}.${previewDomain}${window.location.pathname}`
    )
  }
}

export function BuildSuccessTooltipContent({
  isOnPrettyUrl,
  sitePrefix,
  orgId,
  siteId,
  buildId,
}) {
  return (
    <>
      {`New preview available`}
      <button
        onClick={() => {
          newPreviewAvailableClick({
            isOnPrettyUrl,
            sitePrefix,
            orgId,
            siteId,
            buildId,
          })
        }}
        data-gatsby-preview-indicator="tooltip-link"
      >
        <p data-gatsby-preview-indicator="tooltip-link-text">{`Click to view`}</p>
      </button>
    </>
  )
}
