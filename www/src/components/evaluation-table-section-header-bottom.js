import presets, { colors } from "../utils/presets"
import React from "react"
import logo from "../monogram.svg"
import jekyll from "../assets/jekyll.svg"
import wordpress from "../assets/wordpress.png"
import squarespace from "../assets/squarespace-compressed.png"
import { rhythm, scale, options } from "../utils/typography"

const subHeaderTitleStyles = {
  height: rhythm(3 / 4),
  marginBottom: 0,
  display: `block`,
  margin: `auto`,
  [presets.Mobile]: {
    height: rhythm(5 / 4),
  },
}

const subHeaderTitles = [
  ``,
  <img src={logo} key="0" css={subHeaderTitleStyles} />,
  <img src={jekyll} key="1" css={subHeaderTitleStyles} />,
  <img src={wordpress} key="2" css={subHeaderTitleStyles} />,
  <img src={squarespace} key="3" css={subHeaderTitleStyles} />,
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
          background: `${colors.ui.whisper}`,
          // borderLeft: i > 0 ? `1px solid ${colors.ui.light}` : `none`,
          // borderRight: i === 5 ? `1px solid ${colors.ui.light}` : `none`,
          fontWeight: 600,
          ...scale(-1 / 9),
          lineHeight: 1.3,
          textAlign: `left`,
          verticalAlign: `middle`,
          fontFamily: options.headerFontFamily.join(`,`),
          borderColor: colors.ui.light,
          "&&": {
            paddingTop: rhythm(1 / 4),
            paddingLeft: rhythm(1 / 4),
            paddingRight: i >= 1 ? rhythm(1 / 2) : 0,
            paddingBottom: rhythm(1 / 4),
            "&:last-child": {
              paddingRight: i >= 1 ? rhythm(1 / 2) : 0,
            },
          },
          [presets.Mobile]: {
            paddingTop: rhythm(1 / 2),
            paddingLeft: `${rhythm(1 / 2)} !important`,
            paddingRight: rhythm(1 / 2),
            paddingBottom: rhythm(1 / 2),
            "&:last-child": {
              paddingRight: rhythm(1 / 2),
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
