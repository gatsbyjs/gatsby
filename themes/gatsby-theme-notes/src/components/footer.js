import React from "react"
import { css } from "theme-ui"

const Footer = () => (
  <footer
    css={css({
      mt: 4,
      pt: 3,
    })}
  >
    © {new Date().getFullYear()}, Powered by
    {` `}
    <a href="https://www.gatsbyjs.org">Gatsby</a>
    {` `}&bull;{` `}
  </footer>
)

export default Footer
