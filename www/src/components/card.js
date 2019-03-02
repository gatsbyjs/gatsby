import React from "react"
import presets, { colors } from "../utils/presets"
import { rhythm } from "../utils/typography"

const Card = ({ children }) => (
  <div
    css={{
      boxSizing: `border-box`,
      display: `flex`,
      transform: `translateZ(0)`,
      [presets.Tablet]: {
        flex: `0 0 auto`,
        maxWidth: `50%`,
        boxShadow: `0 1px 0 0 ${colors.ui.light}`,
        "&:nth-of-type(5),&:nth-of-type(6)": {
          boxShadow: `none`,
        },
        "&:nth-of-type(2n)": {
          borderLeft: `1px solid ${colors.ui.light}`,
        },
      },
      [presets.Hd]: {
        flex: `0 0 auto`,
        maxWidth: `33.33333333%`,
        borderLeft: `1px solid ${colors.ui.light}`,
        "&:nth-of-type(4)": {
          boxShadow: `none`,
        },
        "&:nth-of-type(3n+1)": {
          borderLeft: 0,
        },
      },
    }}
  >
    <div
      css={{
        padding: rhythm(presets.gutters.default / 2),
        paddingBottom: 0,
        transform: `translateZ(0)`,
        [presets.Mobile]: {
          padding: rhythm(presets.gutters.default),
        },
      }}
    >
      {children}
    </div>
  </div>
)

export default Card
