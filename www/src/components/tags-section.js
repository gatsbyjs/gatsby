import React from "react"
import Link from "gatsby-link"
import { rhythm, scale } from "../utils/typography"
const _ = require(`lodash`)

const TagsSection = ({ tags }) => {
  if (!tags) return null
  const tagLinks = tags.map((tag, i) => {
    const divider = i < tags.length - 1 && <span>{` | `}</span>
    return (
      <span key={tag}>
        <Link to={`/blog/tags/${_.kebabCase(tag)}`}>{tag}</Link>
        {divider}
      </span>
    )
  })
  return (
    <em
      style={{
        ...scale(-1 / 5),
        display: `block`,
        marginBottom: rhythm(1),
      }}
    >
      Tagged with {tagLinks}
    </em>
  )
}

export default TagsSection
