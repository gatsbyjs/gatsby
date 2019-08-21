import React from "react"
import { Link } from "gatsby"
import {
  fontSizes,
  colors,
  space,
  mediaQueries,
  letterSpacings,
  transition,
} from "../utils/presets"

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
        css={{
          [mediaQueries.xl]: {
            fontSize: fontSizes[1],
          },
        }}
        key={location.pathname + item.url}
      >
        <Link
          css={{
            "&&": {
              color: colors.grey[60],
              border: 0,
              transition: `all ${transition.speed.fast} ${
                transition.curve.default
              }`,
              ":hover": {
                color: colors.link.color,
                borderBottom: `1px solid ${colors.link.hoverBorder}`,
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
          <ul
            css={{
              marginLeft: space[6],
            }}
          >
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
        css={{
          textTransform: `uppercase`,
          fontSize: fontSizes[1],
          color: colors.grey[80],
          letterSpacing: letterSpacings.tracked,
          marginTop: 0,
        }}
      >
        Table of Contents
      </h2>
      <ul
        css={{
          [mediaQueries.xl]: {
            listStyle: `none`,
            margin: 0,
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
