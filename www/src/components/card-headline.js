import React from "react"
import presets from "../utils/presets"
import { scale } from "../utils/typography"

const CardHeadline = ({ children }) => (
  <h2
    css={{
      fontSize: scale(2 / 5).fontSize,
      lineHeight: presets.lineHeights.dense,
      marginTop: 0,
    }}
  >
    {children}
  </h2>
)

export default CardHeadline
