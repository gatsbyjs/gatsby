import React from "react"
import { Link } from "gatsby"
import TagsIcon from "react-icons/lib/ti/tags"

import Button from "./button"
import { rhythm } from "../utils/typography"
import { space, fontSizes } from "../utils/presets"
const { kebabCase } = require(`lodash-es`)

const TagsSection = ({ tags }) => {
  if (!tags) return null
  const tagLinks = tags.map((tag, i) => {
    const divider = i < tags.length - 1 && <span>{`, `}</span>
    return (
      <span key={tag}>
        <Link to={`/blog/tags/${kebabCase(tag.toLowerCase())}`}>{tag}</Link>
        {divider}
      </span>
    )
  })
  return (
    <div
      css={{
        display: `flex`,
        flexFlow: `row wrap`,
        justifyContent: `space-between`,
        alignItems: `baseline`,
      }}
    >
      <em
        css={{
          fontSize: fontSizes[1],
          display: `block`,
          flexBasis: `60%`,
          flexGrow: 1,
          fontStyle: `normal`,
          marginBottom: space[5],
          marginRight: space[9],
          marginTop: rhythm(3),
        }}
      >
        Tagged with {tagLinks}
      </em>
      <Button
        css={{ flexShrink: 0 }}
        small
        key="blog-post-view-all-tags-button"
        to="/blog/tags"
      >
        View All Tags <TagsIcon />
      </Button>
    </div>
  )
}

export default TagsSection
