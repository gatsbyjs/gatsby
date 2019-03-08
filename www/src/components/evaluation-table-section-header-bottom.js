import React from "react"

import logo from "../monogram.svg"
import jekyll from "../assets/jekyll.svg"
import wordpress from "../assets/wordpress.png"
import squarespace from "../assets/squarespace-compressed.png"
import presets, { colors, space } from "../utils/presets"
import { rhythm, options } from "../utils/typography"

const subHeaderTitleStyles = {
  height: rhythm(space[6]),
  marginBottom: 0,
  display: `block`,
  margin: `auto`,
  [presets.Xs]: {
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
          // borderLeft: i > 0 ? `1px solid ${colors.ui.light}` : `none`,
          // borderRight: i === 5 ? `1px solid ${colors.ui.light}` : `none`,
          fontWeight: 600,
          lineHeight: presets.lineHeights.dense,
          textAlign: `left`,
          verticalAlign: `middle`,
          fontFamily: options.headerFontFamily.join(`,`),
          borderColor: colors.ui.light,
          "&&": {
            paddingTop: rhythm(1 / 4),
            paddingLeft: rhythm(1 / 4),
            paddingRight: i >= 1 ? rhythm(space[3]) : 0,
            paddingBottom: rhythm(1 / 4),
            "&:last-child": {
              paddingRight: i >= 1 ? rhythm(space[3]) : 0,
            },
          },
          [presets.Xs]: {
            paddingTop: rhythm(space[3]),
            paddingLeft: `${rhythm(space[3])} !important`,
            paddingRight: rhythm(space[3]),
            paddingBottom: rhythm(space[3]),
            "&:last-child": {
              paddingRight: rhythm(space[3]),
            },
          },
        }}
      >
        {header || props.category || `Feature`}
      </td>
    ))}
  </tr>
)

export default renderSubHeader
