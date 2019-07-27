/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

import logo from "../monogram.svg"
import jekyll from "../assets/jekyll.svg"
import wordpress from "../assets/wordpress.png"
import squarespace from "../assets/squarespace-compressed.png"
import { mediaQueries } from "../gatsby-plugin-theme-ui"

const subHeaderTitleStyles = t => {
  return {
    height: t.space[6],
    marginBottom: 0,
    display: `block`,
    margin: `auto`,
    [mediaQueries.xs]: {
      height: t.space[7],
    },
  }
}

const subHeaderTitles = [
  ``,
  <img src={logo} key="0" sx={subHeaderTitleStyles} alt={`Gatsby Logo`} />,
  <img src={jekyll} key="1" sx={subHeaderTitleStyles} alt={`Jekyll Logo`} />,
  <img
    src={wordpress}
    key="2"
    sx={subHeaderTitleStyles}
    alt={`WordPress Logo`}
  />,
  <img
    src={squarespace}
    key="3"
    sx={subHeaderTitleStyles}
    alt={`Squarespace Logo`}
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
        sx={{
          background: `ui.background`,
          borderColor: `ui.border.subtle`,
          display: `table-cell`,
          fontFamily: `header`,
          fontWeight: 600,
          lineHeight: `dense`,
          p: 3,
          textAlign: `left`,
          verticalAlign: `middle`,
        }}
      >
        {header || props.category || `Feature`}
      </td>
    ))}
  </tr>
)

export default renderSubHeader
