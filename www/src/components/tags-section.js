/** @jsx jsx */
import { jsx } from "theme-ui"
import Link from "./localized-link"
import { TiTags as TagsIcon } from "react-icons/ti"
import { kebabCase } from "lodash-es"

import Button from "./button"

const containerStyles = {
  display: `flex`,
  flexFlow: `row wrap`,
  justifyContent: `space-between`,
  alignItems: `baseline`,
  borderTop: 1,
  borderColor: `ui.border`,
  mt: 10,
}

const taggedStyles = {
  fontSize: 1,
  flex: `1 1 60%`,
  fontStyle: `normal`,
  mt: 8,
  mr: 9,
  mb: 5,
}

export default function TagsSection({ tags }) {
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
    <div sx={containerStyles}>
      <em sx={taggedStyles}>Tagged with {tagLinks}</em>
      <Button
        sx={{ flexShrink: 0 }}
        variant="small"
        key="blog-post-view-all-tags-button"
        to="/blog/tags"
      >
        View all Tags <TagsIcon />
      </Button>
    </div>
  )
}
