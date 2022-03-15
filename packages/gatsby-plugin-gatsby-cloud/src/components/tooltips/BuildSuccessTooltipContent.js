import React from "react"
import { useTrackEvent } from "../../utils"

const delay = ms => new Promise(resolve => setTimeout(resolve, ms || 50))

const BuildSuccessTooltipContent = ({
  isOnPrettyUrl,
  sitePrefix,
  orgId,
  siteId,
  buildId,
  nodeManifestRedirectUrl,
}) => {
  const { track } = useTrackEvent()

  const newPreviewAvailableClick = async ({
    isOnPrettyUrl,
    sitePrefix,
    orgId,
    siteId,
    buildId,
  }) => {
    track({
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
    const previewDomain = window.location.hostname
      .split(`.`)
      .slice(-2)
      .join(`.`)

    const isLocalhost = window.location.hostname === `localhost`

    if (nodeManifestRedirectUrl) {
      window.location[isLocalhost ? `assign` : `replace`](
        nodeManifestRedirectUrl
      )
    } else if (isOnPrettyUrl || isLocalhost) {
      window.location.reload()
    } else {
      window.location.replace(
        `https://preview-${sitePrefix}.${previewDomain}${window.location.pathname}`
      )
    }
  }

  return (
    <>
      {`This page has been updated.`}
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
        <p data-gatsby-preview-indicator="tooltip-link-text">{`View Changes`}</p>
      </button>
    </>
  )
}

export default BuildSuccessTooltipContent
