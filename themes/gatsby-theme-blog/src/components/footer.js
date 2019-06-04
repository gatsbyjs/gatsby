import React from "react"
import { css } from "theme-ui"
import FooterContent from "./footer-content"

const Footer = () => (
  <footer
    css={css({
      mt: 4,
      pt: 3,
    })}
  >
    <FooterContent />
  </footer>
)

export default Footer
