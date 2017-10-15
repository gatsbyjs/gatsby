import React from 'react'
import presets from "../utils/presets"
import { rhythm } from "../utils/typography"

const superHeaderTitles = [
  `Feature`,
  `Gatsby`,
  `Static site gens`,
  `CMS`,
  `Site builders`,
]

const superHeader = () => (
  <tr key="head">
    {
      superHeaderTitles.map((header, i) => (
        <td
          key={i}
          css={{
            display: `none`,
            padding: rhythm(1 / 2),
            textTransform: `uppercase`,
            fontSize: `80%`,
            fontWeight: 600,
            textAlign: `center`,
            verticalAlign: `bottom`,
            width: i === 0 ? 120 : `inherit`,
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
          <span css={{
            "-webkitHyphens": `auto`,
            "-msHyphens": `auto`,
            hyphens: `auto`,
            display: `inline-block`,
          }}>
            { header }
          </span>
        </td>
      ))
    }
  </tr>
)


export default superHeader
