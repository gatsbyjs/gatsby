import React from "react"
import { Link } from "gatsby"
import { colors, space, breakpoints, fontSizes } from "../../utils/presets"
import sharedStyles from "../shared/styles"
import MdArrowBack from "react-icons/lib/md/arrow-back"

const Header = ({ stub }) => (
  <div
    className="starter-detail-header"
    css={{
      padding: space[6],
      paddingBottom: space[6],
      [breakpoints.sm]: {
        paddingBottom: 0,
      },
      [breakpoints.lg]: {
        padding: space[8],
        paddingBottom: 0,
      },
    }}
  >
    <div css={{ paddingBottom: space[1] }}>
      <Link
        to={`/starters`}
        css={{
          "&&": {
            fontSize: fontSizes[1],
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
        <MdArrowBack style={{ marginRight: space[1] }} />
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
