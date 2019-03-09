import React from "react"
import { Link } from "gatsby"
import presets, { colors, space } from "../../utils/presets"
import { rhythm, options } from "../../utils/typography"
import sharedStyles from "../shared/styles"
import MdArrowBack from "react-icons/lib/md/arrow-back"

const Header = ({ stub }) => (
  <div
    className="starter-detail-header"
    css={{
      padding: rhythm(space[6]),
      paddingBottom: rhythm(options.blockMarginBottom),
      [presets.Sm]: {
        paddingBottom: 0,
      },
      [presets.Lg]: {
        padding: rhythm(space[8]),
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
            fontSize: presets.scale[1],
            boxShadow: `none`,
            borderBottom: 0,
            color: colors.gatsby,
            fontWeight: `normal`,
            "&:hover": {
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
