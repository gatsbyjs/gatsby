/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"

const HorizontalNavList = ({ items = [], slug }) => (
  <nav>
    <ul
      sx={{
        m: 0,
        mb: 4,
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
          sx={t => ({
            m: 0,
            padding: `3px 12px`,
            [t.mediaQueries.tablet]: {
              padding: `0px 6px`,
            },
          })}
          key={item}
        >
          <Link to={`${slug.slice(0, -1)}#${item.toLowerCase()}`}>{item}</Link>
        </li>
      ))}
    </ul>
  </nav>
)

export default HorizontalNavList
