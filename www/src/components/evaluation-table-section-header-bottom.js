import presets from "../utils/presets"
import React from 'react'
import logo from "../gatsby-negative.svg"
import jekyll from "../assets/jekyll.svg"
import wordpress from "../assets/wordpress.png"
import squarespace from "../assets/squarespace-compressed.png"

const subHeaderTitles = [
  `Category`,
  `Feature`,
  <img
    src={logo}
    height={`30`}
    style={{ marginBottom: 0, display: `block`, margin: `auto` }}
  />,
  <img
    src={jekyll}
    height={`30`}
    style={{ marginBottom: 0, display: `block`, margin: `auto` }}
  />,
  <img
    src={wordpress}
    height={`30`}
    style={{ marginBottom: 0, display: `block`, margin: `auto` }}
  />,
  <img
    src={squarespace}
    height={`40`}
    style={{ marginBottom: 0, display: `block`, margin: `auto` }}
  />,
]

const renderSubHeader = () => (
  <tr key="subhead" style={{ display: `table-row` }}>
    {
      subHeaderTitles.map((header, i) => (
        <td
          key={i}
          css={{
            display: i >= 1 ? `table-cell` : `none`,
            borderBottom: `1px solid #dddddd`,
            borderLeft: i > 1 ? `1px solid #dddddd` : `none`,
            borderRight: i === 5 ? `1px solid #dddddd` : `none`,
            paddingTop: 10,
            paddingLeft: 10,
            paddingRight: 10,
            paddingBottom: i == 5 ? 10 : 20,
            textTransform: `uppercase`,
            fontWeight: 600,
            fontSize: `80%`,
            textAlign: `center`,
            verticalAlign: `middle`,
            [presets.Tablet]: {
              display: `table-cell`,
            },
          }
        }>
          { header }
        </td>
      ))
    }
  </tr>
)

export default renderSubHeader