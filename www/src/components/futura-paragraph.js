import React from "react"
import { options } from "../utils/typography"

const FuturaParagraph = ({ children }) => (
  <p
    css={{
      fontFamily: options.headerFontFamily.join(`,`),
      marginBottom: 0,
    }}
  >
    {children}
  </p>
)

export default FuturaParagraph
