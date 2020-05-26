/** @jsx jsx */
import { jsx } from "theme-ui"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const superHeader = ({ columnHeaders }) => (
  <tr>
    {columnHeaders.map((header, i) => (
      <td
        key={i}
        sx={{
          "&&": { p: 3 },
          display: `none`,
          textTransform: `uppercase`,
          fontSize: 0,
          lineHeight: `solid`,
          fontWeight: `body`,
          textAlign: `center`,
          verticalAlign: `bottom`,
          width: i === 0 ? 120 : `inherit`,
          border: 0,
          color: `textMuted`,
          bg: `ui.background`,
          "span:first-of-type": {
            borderTopLeftRadius: 2,
            textAlign: `left`,
          },
          "&:last-child": {
            borderTopRightRadius: 2,
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
          sx={{
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
