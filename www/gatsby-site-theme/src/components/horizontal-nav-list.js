/** @jsx jsx */
import { jsx } from "theme-ui"
import Link from "./localized-link"

import { mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

const HorizontalNavList = ({ items = [], slug }) => (
  <nav>
    <ul
      sx={{
        m: 0,
        display: `flex`,
        flexWrap: `wrap`,
        listStyle: `none`,
        "& * + *": {
          borderLeftStyle: `solid`,
          borderLeftWidth: `1px`,
          borderColor: `ui.border`,
        },
      }}
    >
      {items.map(item => (
        <li
          sx={{
            m: 0,
            padding: `3px 12px`,
            [mediaQueries.md]: {
              padding: `0px 6px`,
            },
          }}
          key={item}
        >
          <Link to={`${slug.slice(0, -1)}#${item.toLowerCase()}`}>{item}</Link>
        </li>
      ))}
    </ul>
  </nav>
)

export default HorizontalNavList
