import presets from "../utils/presets"
import React from 'react'
import logo from "../gatsby-negative.svg"
import jekyll from "../assets/jekyll.svg"
import wordpress from "../assets/wordpress.png"
import squarespace from "../assets/squarespace-compressed.png"
import { rhythm } from "../utils/typography"

const subHeaderTitles = [
  `Feature`,
  <img
    src={logo}
    key="0"
    css={{
      height: rhythm(3 / 4),
      marginBottom: 0,
      display: `block`,
      margin: `auto`,
      [presets.Mobile]: {
        height: rhythm(5 / 4),
      },
    }}
  />,
  <img
    src={jekyll}
    key="1"
    css={{
      height: rhythm(3 / 4),
      marginBottom: 0,
      display: `block`,
      margin: `auto`,
      [presets.Mobile]: {
        height: rhythm(5 / 4),
      },
    }}
  />,
  <img
    src={wordpress}
    key="2"
    css={{
      height: rhythm(3 / 4),
      marginBottom: 0,
      display: `block`,
      margin: `auto`,
      [presets.Mobile]: {
        height: rhythm(5 / 4),
      },
    }}
  />,
  <img
    src={squarespace}
    key="3"
    css={{
      height: rhythm(3 / 4),
      marginBottom: 0,
      display: `block`,
      margin: `auto`,
      [presets.Mobile]: {
        height: rhythm(5 / 4),
      },
    }}
  />,
]

const renderSubHeader = () => (
  <tr key="subhead" style={{ display: `table-row` }}>
    {
      subHeaderTitles.map((header, i) => (
        <td
          key={i}
          css={{
            display: `table-cell`,
            borderBottom: `none`,
            //borderLeft: i > 1 ? `1px solid #dddddd` : `none`,
            //borderRight: i === 5 ? `1px solid #dddddd` : `none`,
            paddingTop: rhythm(1 / 4),
            paddingLeft: rhythm(1 / 4),
            paddingRight: i >= 1 ? rhythm(1 / 4) : 0,
            paddingBottom: rhythm(1 / 4),
            textTransform: `uppercase`,
            fontWeight: 600,
            fontSize: `80%`,
            textAlign: `center`,
            verticalAlign: `middle`,
            "&:last-child": {
              paddingRight: rhythm(1 / 2),
            },
            [presets.Mobile]: {
              paddingTop: rhythm(1 / 2),
              paddingLeft: rhythm(1 / 2),
              paddingRight: i >= 1 ? rhythm(1 / 2) : 0,
              "&:last-child": {
                paddingRight: rhythm(1 / 2),
              },
              paddingBottom: rhythm(1 / 2),
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