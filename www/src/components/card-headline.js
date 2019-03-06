import React from "react"
import presets from "../utils/presets"
import { scale } from "../utils/typography"

const CardHeadline = ({ children }) => (
  <h2
    css={{
      fontSize: scale(2 / 5).fontSize,
      lineHeight: presets.lineHeights.dense,
      marginTop: 0,
      [presets.Md]: {
        fontSize: scale(1 / 10).fontSize,
      },
      [presets.Lg]: {
        fontSize: scale(3 / 10).fontSize,
      },
      [presets.Xxl]: {
        fontSize: scale(5 / 10).fontSize,
      },
    }}
  >
    {children}
  </h2>
)

export default CardHeadline
