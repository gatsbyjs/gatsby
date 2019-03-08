import React from "react"
import { options } from "../utils/typography"
import presets from "../utils/presets"

const FuturaParagraph = ({ children }) => (
  <p
    css={{
      fontFamily: options.headerFontFamily.join(`,`),
      marginBottom: 0,
      fontSize: presets.scale[3],
      WebkitFontSmoothing: `antialiased`,
    }}
  >
    {children}
  </p>
)

export default FuturaParagraph
