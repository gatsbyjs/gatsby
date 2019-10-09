/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import { mediaQueries, colors } from "../gatsby-plugin-theme-ui"

function isUnderDepthLimit(depth, maxDepth) {
  if (maxDepth === null) {
    // if no maxDepth is passed in, continue to render more items
    return true
  } else {
    return depth < maxDepth
  }
}

// depth and maxDepth are used to figure out how many bullets deep to render in the ToC sidebar, if no
// max depth is set via the tableOfContentsDepth field in the frontmatter, all headings will be rendered
function createItems(items, location, depth, maxDepth) {
  return (
    items &&
    items.map(item => (
      <li
        sx={{ [mediaQueries.xl]: { fontSize: 1 } }}
        key={location.pathname + item.url}
      >
        <Link
          sx={{
            "&&": {
              color: `textMuted`,
              border: 0,
              transition: t =>
                `all ${t.transition.speed.fast} ${t.transition.curve.default}`,
              ":hover": {
                color: `link.color`,
                borderBottom: t => `1px solid ${t.colors.link.hoverBorder}`,
              },
            },
          }}
          getProps={({ href, location }) =>
            location && location.href && location.href.includes(href)
              ? {
                  style: {
                    color: colors.link.color,
                    borderBottom: `1px solid ${colors.link.hoverBorder}`,
                  },
                }
              : null
          }
          to={location.pathname + item.url}
        >
          {item.title}
        </Link>
        {item.items && isUnderDepthLimit(depth, maxDepth) && (
          <ul sx={{ ml: 6 }}>
            {createItems(item.items, location, depth + 1, maxDepth)}
          </ul>
        )}
      </li>
    ))
  )
}

function TableOfContents({ page, location }) {
  return page.tableOfContents.items ? (
    <nav>
      <h2
        sx={{
          textTransform: `uppercase`,
          fontSize: 1,
          color: `textMuted`,
          letterSpacing: `tracked`,
          mt: 0,
        }}
      >
        Table of Contents
      </h2>
      <ul
        sx={{
          [mediaQueries.xl]: {
            listStyle: `none`,
            m: 0,
          },
        }}
      >
        {createItems(
          page.tableOfContents.items,
          location,
          1,
          page.frontmatter.tableOfContentsDepth
        )}
      </ul>
    </nav>
  ) : null
}

export default TableOfContents
