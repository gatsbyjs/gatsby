import React from "react"
import { fontSizes, fonts } from "../utils/presets"

const FuturaParagraph = ({ children }) => (
  <p
    css={{
      fontFamily: fonts.header,
      marginBottom: 0,
      fontSize: fontSizes[3],
      WebkitFontSmoothing: `antialiased`,
    }}
  >
    {children}
  </p>
)

export default FuturaParagraph
