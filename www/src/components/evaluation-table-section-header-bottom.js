import React from "react"

import logo from "../assets/monogram.svg"
import jekyll from "../assets/vendor-logos/jekyll.svg"
import wordpress from "../assets/vendor-logos/wordpress.png"
import squarespace from "../assets/vendor-logos/squarespace-compressed.png"
import {
  colors,
  space,
  mediaQueries,
  lineHeights,
  fonts,
} from "../utils/presets"
import { rhythm } from "../utils/typography"

const subHeaderTitleStyles = {
  height: space[6],
  marginBottom: 0,
  display: `block`,
  margin: `auto`,
  [mediaQueries.xs]: {
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
          background: colors.ui.background,
          fontWeight: 600,
          lineHeight: lineHeights.dense,
          textAlign: `left`,
          verticalAlign: `middle`,
          fontFamily: fonts.header,
          borderColor: colors.ui.border.subtle,
          padding: space[3],
        }}
      >
        {header || props.category || `Feature`}
      </td>
    ))}
  </tr>
)

export default renderSubHeader
