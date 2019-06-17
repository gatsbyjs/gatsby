import React from "react"
import { css } from "theme-ui"
import HomeFooterContent from "./home-footer-content"

const Footer = () => (
  <footer
    css={css({
      mt: 4,
      pt: 3,
    })}
  >
    <HomeFooterContent />
  </footer>
)

export default Footer
