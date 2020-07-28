/** @jsx jsx */
import { jsx } from "theme-ui"
import FeedbackWidget from "./feedback-widget/feedback-widget"

export default function DocSearchContent({ children }) {
  return (
    <main
      id={`reach-skip-nav`}
      className={`docSearch-content`}
      // need this for the main sidebar's anchor links to work properly
      // in the context of `template-docs-markdown`
      sx={{ position: `relative` }}
    >
      {children}
      <FeedbackWidget />
    </main>
  )
}
