import React from "react"
import { css } from "theme-ui"
import PostFooterContent from "./post-footer-content"

const Footer = props => (
  <footer
    css={css({
      mt: 4,
      pt: 3,
    })}
  >
    <PostFooterContent {...props} />
  </footer>
)

export default Footer
