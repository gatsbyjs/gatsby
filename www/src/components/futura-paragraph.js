import React from "react"
import { scale, fonts } from "../utils/presets"

const FuturaParagraph = ({ children }) => (
  <p
    css={{
      fontFamily: fonts.header,
      marginBottom: 0,
      fontSize: scale[3],
      WebkitFontSmoothing: `antialiased`,
    }}
  >
    {children}
  </p>
)

export default FuturaParagraph
