import React from "react"

import logo from "../monogram.svg"
import jekyll from "../assets/jekyll.svg"
import wordpress from "../assets/wordpress.png"
import squarespace from "../assets/squarespace-compressed.png"
import {
  colors,
  space,
  breakpoints,
  lineHeights,
  fonts,
} from "../utils/presets"
import { rhythm } from "../utils/typography"

const subHeaderTitleStyles = {
  height: space[6],
  marginBottom: 0,
  display: `block`,
  margin: `auto`,
  [breakpoints.xs]: {
    height: rhythm(5 / 4),
  },
}

const subHeaderTitles = [
  ``,
  <img src={logo} key="0" css={subHeaderTitleStyles} alt={`Gatsby Logo`} />,
  <img src={jekyll} key="1" css={subHeaderTitleStyles} alt={`Jekyll Logo`} />,
  <img
    src={wordpress}
    key="2"
    css={subHeaderTitleStyles}
    alt={`WordPress Logo`}
  />,
  <img
    src={squarespace}
    key="3"
    css={subHeaderTitleStyles}
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
        css={{
          display: `table-cell`,
          background: colors.ui.whisper,
          fontWeight: 600,
          lineHeight: lineHeights.dense,
          textAlign: `left`,
          verticalAlign: `middle`,
          fontFamily: fonts.header,
          borderColor: colors.ui.light,
          padding: space[3],
        }}
      >
        {header || props.category || `Feature`}
      </td>
    ))}
  </tr>
)

export default renderSubHeader
