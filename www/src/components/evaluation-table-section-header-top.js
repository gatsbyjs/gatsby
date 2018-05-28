import React from "react"
import presets, { colors } from "../utils/presets"
import { scale, rhythm, options } from "../utils/typography"

const superHeaderTitles = [
  `Feature`,
  `Gatsby`,
  `Static site gens`,
  `CMS`,
  `Site builders`,
]

const superHeader = () => (
  <tr>
    {superHeaderTitles.map((header, i) => (
      <td
        key={i}
        css={{
          "&&": {
            padding: `${rhythm(1 / 2)} ${rhythm(1 / 2)} ${rhythm(3 / 8)}`,
          },
          display: `none`,
          textTransform: `uppercase`,
          ...scale(-3 / 6),
          lineHeight: 1,
          fontWeight: 500,
          textAlign: `center`,
          verticalAlign: `bottom`,
          width: i === 0 ? 120 : `inherit`,
          border: 0,
          // fontFamily: options.headerFontFamily.join(`,`),
          color: colors.gray.calm,
          background: colors.ui.whisper,
          "&:first-child": {
            borderTopLeftRadius: presets.radiusLg,
            textAlign: `left`,
          },
          "&:last-child": {
            borderTopRightRadius: presets.radiusLg,
          },
          [presets.Mobile]: {
            display: `table-cell`,
            width: 125,
          },
          [presets.Tablet]: {
            width: 150,
          },
          [presets.Desktop]: {
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
