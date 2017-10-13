import React from 'react'
import presets from "../utils/presets"

const superHeaderTitles = [
  ``,
  ``,
  `Gatsby`,
  `Static frameworks`,
  `Open-source CMS`,
  `Site builders`,
]

const superHeader = () => (
  <tr key="head">
    {
      superHeaderTitles.map((header, i) => (
        <td
          key={i}
          css={{
            display: i >= 1 ? `table-cell` : `none`,
            borderBottom: i > 1 ? `1px solid #dddddd` : `none`,
            padding: 10,
            textTransform: `uppercase`,
            fontSize: `80%`,
            fontWeight: 600,
            textAlign: `center`,
            verticalAlign: `bottom`,
            [presets.Tablet]: {
              display: `table-cell`,
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
