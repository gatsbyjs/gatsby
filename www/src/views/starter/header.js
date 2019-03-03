import React from "react"
import { Link } from "gatsby"
import presets, { colors } from "../../utils/presets"
import { rhythm, scale, options } from "../../utils/typography"
import sharedStyles from "../shared/styles"
import MdArrowBack from "react-icons/lib/md/arrow-back"

const Header = ({ stub }) => (
  <div
    className="starter-detail-header"
    css={{
      fontFamily: options.headerFontFamily.join(`,`),
      padding: sharedStyles.gutter,
      paddingBottom: rhythm(options.blockMarginBottom),
      [presets.Sm]: {
        paddingBottom: 0,
      },
      [presets.Lg]: {
        padding: sharedStyles.gutterDesktop,
        paddingBottom: 0,
      },
    }}
  >
    <div
      css={{
        paddingBottom: rhythm(1 / 4),
      }}
    >
      <Link
        to={`/starters`}
        css={{
          "&&": {
            ...scale(1 / 5),
            boxShadow: `none`,
            borderBottom: 0,
            color: colors.gatsby,
            cursor: `pointer`,
            fontFamily: options.headerFontFamily.join(`,`),
            fontWeight: `normal`,
            "&:hover": {
              background: `transparent`,
              color: colors.lilac,
            },
          },
          ...sharedStyles.withTitleHover,
        }}
      >
        <MdArrowBack style={{ marginRight: 4, verticalAlign: `sub` }} />
        &nbsp;
        <span className="title">All Starters</span>
      </Link>
    </div>
    <div>
      <h1 css={{ margin: 0, display: `inline-block` }}>{stub}</h1>
    </div>
  </div>
)

export default Header
