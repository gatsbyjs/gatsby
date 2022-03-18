import React, { FC } from "react"
import { logsIcon } from "../../icons"
import { linkTextStyle, linkWrapperStyle } from "../tooltip-content.css"

interface IFeedbackTooltipContent {
  url: string
  onURLOpened: () => void
}

const FeedbackTooltipContent: FC<IFeedbackTooltipContent> = ({
  url,
  onURLOpened,
}) => {
  const openFeedbackPage = (): void => {
    onURLOpened?.()
    window.open(url, `blank`, `noreferrer`)
  }
  return (
    <>
      <span style={{ marginRight: `5px` }}>How are we doing?</span>
      <div onClick={openFeedbackPage} className={linkWrapperStyle}>
        <span className={linkTextStyle}>Share feedback</span>
        {logsIcon}
      </div>
    </>
  )
}

export default FeedbackTooltipContent
