/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"
import { Link } from "gatsby"
import { mediaQueries } from "../gatsby-plugin-theme-ui"

function createItems(items, location) {
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
              color: `text.secondary`,
              border: 0,
              transition: t =>
                `all ${t.transition.speed.fast} ${t.transition.curve.default}`,
              ":hover": {
                color: `link.color`,
                borderBottom: t => `1px solid ${t.colors.link.hoverBorder}`,
              },
            },
          }}
          to={location.pathname + item.url}
        >
          {item.title}
        </Link>
        {item.items && (
          <ul sx={{ ml: 6 }}>{createItems(item.items, location)}</ul>
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
          color: `text.secondary`,
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
        {createItems(page.tableOfContents.items, location)}
      </ul>
    </nav>
  ) : null
}

export default TableOfContents
