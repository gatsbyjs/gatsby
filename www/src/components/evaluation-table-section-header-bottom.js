import presets from "../utils/presets"
import React from "react"
import logo from "../gatsby-negative.svg"
import jekyll from "../assets/jekyll.svg"
import wordpress from "../assets/wordpress.png"
import squarespace from "../assets/squarespace-compressed.png"
import { rhythm } from "../utils/typography"

const subHeaderTitles = [
  ``,
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

const renderSubHeader = props => (
  <tr
    key="subhead"
    style={{
      display: !props.display ? `none` : `table-row`,
    }}
  >
    {subHeaderTitles.map((header, i) => (
      <td
        key={i}
        css={{
          display: `table-cell`,
          background: `#f8f8f8`,
          //borderLeft: i > 1 ? `1px solid #dddddd` : `none`,
          //borderRight: i === 5 ? `1px solid #dddddd` : `none`,
          paddingTop: rhythm(1 / 4),
          paddingLeft: rhythm(1 / 4),
          paddingRight: i >= 1 ? rhythm(1 / 4) : 0,
          paddingBottom: rhythm(1 / 4),
          fontStyle: `italic`,
          fontWeight: 600,
          textAlign: `center`,
          verticalAlign: `middle`,
          fontSize: `90%`,
          lineHeight: `${rhythm(1)}`,
          "&:last-child": {
            paddingRight: rhythm(1 / 2),
          },
          [presets.Mobile]: {
            paddingTop: rhythm(1 / 2),
            paddingLeft: `${rhythm(1 / 2)} !important`,
            paddingRight: rhythm(1 / 2),
            "&:last-child": {
              paddingRight: rhythm(1 / 2),
            },
            paddingBottom: rhythm(1 / 2),
          },
        }}
      >
        {header || props.category || `Feature`}
      </td>
    ))}
  </tr>
)

export default renderSubHeader
