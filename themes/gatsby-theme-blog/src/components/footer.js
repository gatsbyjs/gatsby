import React from "react"
import { css } from "theme-ui"
import FooterContent from "./footerContent"

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
