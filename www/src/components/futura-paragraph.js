import React from "react"
import { rhythm, scale, options } from "../utils/typography"
import presets, { colors, space } from "../utils/presets"

const FuturaParagraph = ({ children }) => (
  <p
    css={{
      fontFamily: options.headerFontFamily.join(`,`),
      marginBottom: 0,
      fontSize: scale(1 / 6).fontSize,
      WebkitFontSmoothing: `antialiased`,
      [presets.Md]: {
        fontSize: scale(2 / 6).fontSize,
      },
    }}
  >
    {children}
  </p>
)

export default FuturaParagraph
