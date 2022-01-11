import React from "react"

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
      <span
        data-gatsby-preview-indicator="tooltip-link-text"
        onClick={openFeedbackPage}
      >
        Share feedback
      </span>
    </>
  )
}

export default FeedbackTooltipContent
