import React from 'react'
import presets from "../utils/presets"
import { rhythm } from "../utils/typography"

const superHeaderTitles = [
  `Feature`,
  `Gatsby`,
  `Static frameworks`,
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
            borderBottom: `none`,
            padding: rhythm(1 / 2),
            textTransform: `uppercase`,
            fontSize: `80%`,
            fontWeight: 600,
            textAlign: `center`,
            verticalAlign: `bottom`,
            [presets.Mobile]: {
              display: `table-cell`,
              maxWidth: 125,
            },
            [presets.Tablet]: {
              maxWidth: 150,
            },
            [presets.Desktop]: {
              maxWidth: `inherit`,
            },
          }}
        >
          { header }
        </td>
      ))
    }
  </tr>
)


export default superHeader
