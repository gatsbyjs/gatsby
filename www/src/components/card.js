/** @jsx jsx */
import { jsx } from "theme-ui"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const outerContainerStyles = {
  display: `flex`,
  transform: `translateZ(0)`,
  maxWidth: [null, null, null, `50%`, null, `33.33333333%`],
  flex: [null, null, null, `0 0 auto`],
  [mediaQueries.md]: {
    boxShadow: t => `0 1px 0 0 ${t.colors.ui.border}`,
    "&:nth-of-type(5), &:nth-of-type(6)": { boxShadow: `none` },
    "&:nth-of-type(2n)": {
      borderLeft: 1,
      borderColor: `ui.border`,
    },
  },
  [mediaQueries.xl]: {
    borderLeft: 1,
    borderColor: `ui.border`,
    "&:nth-of-type(4)": { boxShadow: `none` },
    "&:nth-of-type(3n+1)": { borderLeft: 0 },
  },
}

const innerContainerStyles = {
  px: [0, null, 8],
  py: [null, null, 8],
  pt: 8,
  transform: `translateZ(0)`,
}

export default function Card({ children }) {
  return (
    <div sx={outerContainerStyles}>
      <div sx={innerContainerStyles}>{children}</div>
    </div>
  )
}
