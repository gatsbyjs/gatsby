/** @jsx jsx */
import { jsx } from "theme-ui"
import { Link } from "gatsby"
import { colors, mediaQueries } from "gatsby-design-tokens/dist/theme-gatsbyjs-org"

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
    items.map((item, index) => (
      <li
        sx={{ [mediaQueries.xl]: { fontSize: 1 } }}
        key={location.pathname + (item.url || depth + `-` + index)}
      >
        {item.url && (
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
        )}
        {item.items && isUnderDepthLimit(depth, maxDepth) && (
          <ul sx={{ color: `textMuted`, listStyle: `none`, ml: 5 }}>
            {createItems(item.items, location, depth + 1, maxDepth)}
          </ul>
        )}
      </li>
    ))
  )
}

function TableOfContents({ page, location }) {
  return page.tableOfContents.items ? (
    <nav
      sx={{
        mb: [8, null, null, null, null, 0],
        pb: [6, null, null, null, null, 0],
        borderBottom: t => [
          `1px solid ${t.colors.ui.border}`,
          null,
          null,
          null,
          null,
          0,
        ],
      }}
    >
      <h2
        sx={{
          color: `textMuted`,
          fontSize: 1,
          letterSpacing: `tracked`,
          mt: 0,
          textTransform: `uppercase`,
        }}
      >
        Table of Contents
      </h2>
      <ul
        sx={{
          listStyle: `none`,
          m: 0,
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
