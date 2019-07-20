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

function createItems(items, location) {
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
          to={location.pathname + item.url}
        >
          {item.title}
        </Link>
        {item.items && (
          <ul
            css={{
              marginLeft: space[6],
            }}
          >
            {createItems(item.items, location)}
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
        {createItems(page.tableOfContents.items, location)}
      </ul>
    </nav>
  ) : null
}

export default TableOfContents
