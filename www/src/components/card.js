/** @jsx jsx */
import { jsx } from "theme-ui"

import { mediaQueries } from "../gatsby-plugin-theme-ui"

const Card = ({ children }) => (
  <div
    sx={{
      boxSizing: `border-box`,
      display: `flex`,
      transform: `translateZ(0)`,
      [mediaQueries.md]: {
        flex: `0 0 auto`,
        maxWidth: `50%`,
        boxShadow: t => `0 1px 0 0 ${t.colors.ui.border}`,
        "&:nth-of-type(5), &:nth-of-type(6)": { boxShadow: `none` },
        "&:nth-of-type(2n)": {
          borderLeft: t => `1px solid ${t.colors.ui.border}`,
        },
      },
      [mediaQueries.xl]: {
        flex: `0 0 auto`,
        maxWidth: `33.33333333%`,
        borderLeft: t => `1px solid ${t.colors.ui.border}`,
        "&:nth-of-type(4)": { boxShadow: `none` },
        "&:nth-of-type(3n+1)": { borderLeft: 0 },
      },
    }}
  >
    <div
      sx={{
        p: 6,
        pb: 0,
        transform: `translateZ(0)`,
        [mediaQueries.sm]: { p: 8 },
      }}
    >
      {children}
    </div>
  </div>
)

export default Card
