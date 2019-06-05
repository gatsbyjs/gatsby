import React from "react"
import {
  colors,
  space,
  radii,
  mediaQueries,
  fontSizes,
  lineHeights,
} from "../../utils/presets"
import { rhythm } from "../../utils/typography"

const superHeader = ({ columnHeaders }) => (
  <tr>
    {columnHeaders.map((header, i) => (
      <td
        key={i}
        css={{
          "&&": {
            padding: `${space[3]} ${space[3]} ${rhythm(3 / 8)}`,
          },
          display: `none`,
          textTransform: `uppercase`,
          fontSize: fontSizes[0],
          lineHeight: lineHeights.solid,
          fontWeight: 500,
          textAlign: `center`,
          verticalAlign: `bottom`,
          width: i === 0 ? 120 : `inherit`,
          border: 0,
          color: colors.text.secondary,
          background: colors.ui.background,
          "span:first-of-type": {
            borderTopLeftRadius: radii[2],
            textAlign: `left`,
          },
          "&:last-child": {
            borderTopRightRadius: radii[2],
          },
          [mediaQueries.xs]: {
            display: `table-cell`,
            width: 125,
          },
          [mediaQueries.md]: {
            width: 150,
          },
          [mediaQueries.lg]: {
            width: 175,
          },
        }}
      >
        <span
          css={{
            WebkitHyphens: `auto`,
            MsHyphens: `auto`,
            hyphens: `auto`,
            display: `inline-block`,
          }}
        >
          {header}
        </span>
      </td>
    ))}
  </tr>
)

export default superHeader
