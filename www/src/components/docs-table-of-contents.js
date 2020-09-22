/** @jsx jsx */
import { jsx } from "theme-ui"
import Link from "./localized-link"
import {
  mediaQueries,
  breakpoints,
} from "gatsby-design-tokens/dist/theme-gatsbyjs-org"
import { useEffect, useState } from "react"
import { useActiveHash } from "../hooks/use-active-hash"

const getHeadingIds = (
  toc,
  traverseFullDepth = true,
  depth,
  recursionDepth = 1
) => {
  const idList = []
  const hashToId = str => str.slice(1)

  if (toc) {
    for (const item of toc) {
      // Sometimes url does not exist on item. See #19851
      if (item.url) {
        idList.push(hashToId(item.url))
      }

      // Only traverse sub-items if specified (they are not displayed in ToC)
      // recursion depth should only go up to 6 headings deep and may come in as
      // undefined if not set in the tableOfContentsDepth frontmatter field
      if (item.items && traverseFullDepth && recursionDepth < (depth || 6)) {
        idList.push(
          ...getHeadingIds(item.items, true, depth, recursionDepth + 1)
        )
      }
    }
  }

  return idList
}

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
function createItems(items, location, depth, maxDepth, activeHash, isDesktop) {
  return (
    items &&
    items.map((item, index) => {
      const isActive = isDesktop && item.url === `#${activeHash}`
      return (
        <li
          data-testid={item.url || ``}
          sx={{ [mediaQueries.xl]: { fontSize: 1 } }}
          key={location.pathname + (item.url || depth + `-` + index)}
        >
          {item.url && (
            <Link
              sx={{
                "&&": {
                  color: isActive ? `link.color` : `textMuted`,
                  border: 0,
                  borderBottom: isActive ? 1 : 0,
                  borderColor: `link.hoverBorder`,
                  transition: t =>
                    `all ${t.transition.speed.fast} ${t.transition.curve.default}`,
                  ":hover": {
                    color: `link.color`,
                    borderColor: `link.hoverBorder`,
                  },
                },
              }}
              to={location.pathname + item.url}
            >
              {item.title}
            </Link>
          )}
          {item.items && isUnderDepthLimit(depth, maxDepth) && (
            <ul sx={{ color: `textMuted`, listStyle: `none`, ml: 5 }}>
              {createItems(
                item.items,
                location,
                depth + 1,
                maxDepth,
                activeHash,
                isDesktop
              )}
            </ul>
          )}
        </li>
      )
    })
  )
}

function TableOfContents({ items, depth, location }) {
  const [isDesktop, setIsDesktop] = useState(false)
  const activeHash = useActiveHash(getHeadingIds(items, true, depth))

  useEffect(() => {
    const isDesktopQuery = window.matchMedia(`(min-width: ${breakpoints[4]})`) // 1200px
    setIsDesktop(isDesktopQuery.matches)

    const updateIsDesktop = e => setIsDesktop(e.matches)
    isDesktopQuery.addListener(updateIsDesktop)
    return () => isDesktopQuery.removeListener(updateIsDesktop)
  }, [])

  return items ? (
    <nav
      sx={{
        mb: [8, null, null, null, null, 0],
        pb: [6, null, null, null, null, 0],
        borderBottom: [1, null, null, null, null, 0],
        borderColor: `ui.border`,
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
        {createItems(items, location, 1, depth, activeHash, isDesktop)}
      </ul>
    </nav>
  ) : null
}

export default TableOfContents
