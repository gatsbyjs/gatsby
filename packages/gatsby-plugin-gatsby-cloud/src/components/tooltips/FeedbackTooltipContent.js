import React from "react"
import { logsIcon } from "../icons"

const FeedbackTooltipContent = ({ url, onOpened }) => {
  const openFeedbackPage = () => {
    if (onOpened) {
      onOpened()
    }
    window.open(url, `blank`, `noreferrer`)
  }
  return (
    <>
      <span style={{ marginRight: `5px` }}>How are we doing?</span>
      <div
        data-gatsby-preview-indicator="tooltip-link-text"
        onClick={openFeedbackPage}
      >
        Share feedback
        <span data-gatsby-preview-indicator="tooltip-svg">{logsIcon}</span>
      </div>
    </>
  )
}

export default FeedbackTooltipContent
