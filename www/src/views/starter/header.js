/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link } from "gatsby"
import { mediaQueries } from "../../gatsby-plugin-theme-ui"
import { withTitleHover } from "../shared/styles"
import MdArrowBack from "react-icons/lib/md/arrow-back"

const Header = ({ stub }) => (
  <div
    className="starter-detail-header"
    sx={{
      p: 6,
      [mediaQueries.sm]: { pb: 0 },
      [mediaQueries.lg]: { p: 8, pb: 0 },
    }}
  >
    <div sx={{ pb: 1 }}>
      <Link
        to={`/starters`}
        sx={{
          "&&": {
            fontSize: 1,
            borderBottom: 0,
            color: `gatsby`,
            fontWeight: `normal`,
            "&:hover": {
              color: `lilac`,
            },
          },
          ...withTitleHover,
        }}
      >
        <MdArrowBack sx={{ mr: 1 }} />
        &nbsp;
        <span className="title">All Starters</span>
      </Link>
    </div>
    <div>
      <h1 sx={{ m: 0, display: `inline-block` }}>{stub}</h1>
    </div>
  </div>
)

export default Header
