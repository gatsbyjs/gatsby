import presets from "../utils/presets"
import React from 'react'
import logo from "../gatsby-negative.svg"
import jekyll from "../assets/jekyll.svg"
import wordpress from "../assets/wordpress.png"
import squarespace from "../assets/squarespace-compressed.png"
import { rhythm } from "../utils/typography"

const subHeaderTitles = [
  `Category`,
  `Feature`,
  <img
    src={logo}
    key="0"
    style={{ height: rhythm(5 / 4), marginBottom: 0, display: `block`, margin: `auto` }}
  />,
  <img
    src={jekyll}
    key="1"
    style={{ height: rhythm(5 / 4), marginBottom: 0, display: `block`, margin: `auto` }}
  />,
  <img
    src={wordpress}
    key="2"
    style={{ height: rhythm(5 / 4), marginBottom: 0, display: `block`, margin: `auto` }}
  />,
  <img
    src={squarespace}
    key="3"
    style={{ height: rhythm(3 / 2), marginBottom: 0, display: `block`, margin: `auto` }}
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
            paddingTop: rhythm(1 / 2),
            paddingLeft: rhythm(1 / 2),
            paddingRight: rhythm(1 / 2),
            paddingBottom: rhythm(1 / 2),
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