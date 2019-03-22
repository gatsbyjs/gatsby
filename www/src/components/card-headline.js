import React from "react"
import { lineHeights, scale } from "../utils/presets"

const CardHeadline = ({ children }) => (
  <h2
    css={{
      fontSize: scale[4],
      lineHeight: lineHeights.dense,
      marginTop: 0,
    }}
  >
    {children}
  </h2>
)

export default CardHeadline
