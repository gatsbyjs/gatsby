/** @jsx jsx */
import { jsx } from "theme-ui"
import Link from "./localized-link"
import { TiTags as TagsIcon } from "react-icons/ti"
import { kebabCase } from "lodash-es"

import Button from "./button"

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
      sx={{
        display: `flex`,
        flexFlow: `row wrap`,
        justifyContent: `space-between`,
        alignItems: `baseline`,
        borderColor: `ui.border`,
        borderTop: 1,
        mt: 10,
      }}
    >
      <em
        sx={{
          fontSize: 1,
          display: `block`,
          flexBasis: `60%`,
          flexGrow: 1,
          fontStyle: `normal`,
          mb: 5,
          mr: 9,
          mt: 8,
        }}
      >
        Tagged with {tagLinks}
      </em>
      <Button
        css={{ flexShrink: 0 }}
        variant="small"
        key="blog-post-view-all-tags-button"
        to="/blog/tags"
      >
        View all Tags <TagsIcon />
      </Button>
    </div>
  )
}

export default TagsSection
