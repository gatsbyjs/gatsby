import React from "react"
import { colors, space, mediaQueries } from "../utils/presets"

const Card = ({ children }) => (
  <div
    css={{
      boxSizing: `border-box`,
      display: `flex`,
      transform: `translateZ(0)`,
      [mediaQueries.md]: {
        flex: `0 0 auto`,
        maxWidth: `50%`,
        boxShadow: `0 1px 0 0 ${colors.purple[10]}`,
        "&:nth-of-type(5), &:nth-of-type(6)": { boxShadow: `none` },
        "&:nth-of-type(2n)": { borderLeft: `1px solid ${colors.purple[10]}` },
      },
      [mediaQueries.xl]: {
        flex: `0 0 auto`,
        maxWidth: `33.33333333%`,
        borderLeft: `1px solid ${colors.purple[10]}`,
        "&:nth-of-type(4)": { boxShadow: `none` },
        "&:nth-of-type(3n+1)": { borderLeft: 0 },
      },
    }}
  >
    <div
      css={{
        padding: space[6],
        paddingBottom: 0,
        transform: `translateZ(0)`,
        [mediaQueries.sm]: { padding: space[8] },
      }}
    >
      {children}
    </div>
  </div>
)

export default Card
