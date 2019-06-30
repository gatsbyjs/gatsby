import React from "react"
import { Link } from "gatsby"
import {
  fontSizes,
  colors,
  zIndices,
  shadows,
  space,
  mediaQueries,
} from "../utils/presets"

function createItems(items, location) {
  return (
    items &&
    items.map(item => (
      <li>
        <Link to={location.pathname + item.url}>{item.title}</Link>
        {item.items && (
          <ul css={{ marginLeft: space[6] }}>
            {createItems(item.items, location)}
          </ul>
        )}
      </li>
    ))
  )
}

function TableOfContents({ page, location }) {
  return page.tableOfContents.items ? (
    <div
      css={{
        background: colors.white,
        zIndex: zIndices.feedbackWidget,

        [mediaQueries.xxl]: {
          padding: space[6],
          boxShadow: shadows.overlay,
          float: `right`,
          marginLeft: space[10],
          position: `sticky`,
          top: 130,
        },
      }}
    >
      <h1
        css={{
          textTransform: `uppercase`,
          fontSize: fontSizes[2],
          color: colors.grey[60],
        }}
      >
        Table of Contents
      </h1>
      <nav>
        <ul>{createItems(page.tableOfContents.items, location)}</ul>
      </nav>
    </div>
  ) : null
}

export default TableOfContents
