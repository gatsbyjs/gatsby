import React from "react"
import { options } from "../utils/typography"
import { scale } from "../utils/presets"

const FuturaParagraph = ({ children }) => (
  <p
    css={{
      fontFamily: options.headerFontFamily.join(`,`),
      marginBottom: 0,
      fontSize: scale[3],
      WebkitFontSmoothing: `antialiased`,
    }}
  >
    {children}
  </p>
)

export default FuturaParagraph
