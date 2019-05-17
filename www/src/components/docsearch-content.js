import React from "react"
import FeedbackWidget from "./feedback-widget/feedback-widget"

export default ({ children }) => (
  <main id={`reach-skip-nav`} className={`docSearch-content`}>
    {children}
    <FeedbackWidget />
  </main>
)
