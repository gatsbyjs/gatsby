import React from "react"
import presets from "../utils/presets"

const CardHeadline = ({ children }) => (
  <h2
    css={{
      fontSize: presets.scale[4],
      lineHeight: presets.lineHeights.dense,
      marginTop: 0,
    }}
  >
    {children}
  </h2>
)

export default CardHeadline
