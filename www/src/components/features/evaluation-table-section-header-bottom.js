import React from "react"

import logo from "../../monogram.svg"
import jekyll from "../../assets/jekyll.svg"
import wordpress from "../../assets/wordpress.png"
import squarespace from "../../assets/squarespace-compressed.png"
import nextjs from "../../assets/nextjs.svg"
import hugo from "../../assets/hugo.png"
import nuxtjs from "../../assets/nuxtjs.png"
import drupal from "../../assets/drupal.png"
import {
  colors,
  space,
  mediaQueries,
  lineHeights,
  fonts,
} from "../../utils/presets"
import { rhythm } from "../../utils/typography"

const subHeaderTitleStyles = {
  height: space[6],
  marginBottom: 0,
  display: `block`,
  margin: `auto`,
  [mediaQueries.xs]: {
    height: rhythm(5 / 4),
  },
}

const subHeaderTitles = {
  Category: ``,
  Gatsby: <img src={logo} css={subHeaderTitleStyles} alt={`Gatsby Logo`} />,
  Jekyll: <img src={jekyll} css={subHeaderTitleStyles} alt={`Jekyll Logo`} />,
  WordPress: (
    <img src={wordpress} css={subHeaderTitleStyles} alt={`WordPress Logo`} />
  ),
  Squarespace: (
    <img
      src={squarespace}
      css={subHeaderTitleStyles}
      alt={`Squarespace Logo`}
    />
  ),
  Nextjs: <img src={nextjs} css={subHeaderTitleStyles} alt={`Next.js Logo`} />,
  Hugo: <img src={hugo} css={subHeaderTitleStyles} alt={`Next.js Logo`} />,
  Nuxtjs: <img src={nuxtjs} css={subHeaderTitleStyles} alt={`Nuxt.js Logo`} />,
  Drupal: <img src={drupal} css={subHeaderTitleStyles} alt={`Nuxt.js Logo`} />,
}

const renderSubHeader = props => (
  <tr
    key="subhead"
    style={{
      display: !props.display ? `none` : `table-row`,
    }}
  >
    {props.nodeFieldProperties.map((nodeProperty, i) => (
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
        {subHeaderTitles[nodeProperty] || props.category || `Feature`}
      </td>
    ))}
  </tr>
)

export default renderSubHeader
