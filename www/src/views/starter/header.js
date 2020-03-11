/** @jsx jsx */
import { jsx } from "theme-ui"
import Link from "../../components/localized-link"
import { MdArrowBack } from "react-icons/md"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { withTitleHover } from "../shared/styles"

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
            color: `link.color`,
            fontWeight: `body`,
            "&:hover": {
              color: `link.hoverColor`,
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
