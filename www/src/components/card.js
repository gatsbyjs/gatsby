/** @jsx jsx */
import { jsx } from "theme-ui"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

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
          borderLeft: 1,
          borderColor: `ui.border`,
        },
      },
      [mediaQueries.xl]: {
        flex: `0 0 auto`,
        maxWidth: `33.33333333%`,
        borderLeft: 1,
        borderColor: `ui.border`,
        "&:nth-of-type(4)": { boxShadow: `none` },
        "&:nth-of-type(3n+1)": { borderLeft: 0 },
      },
    }}
  >
    <div
      sx={{
        pt: 8,
        px: 0,
        transform: `translateZ(0)`,
        [mediaQueries.sm]: {
          px: 8,
          py: 8,
        },
      }}
    >
      {children}
    </div>
  </div>
)

export default Card
