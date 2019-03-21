import React from "react"
import { Link } from "gatsby"

export const toPath = ({ frontmatter, parent = {} }) => {
  if (frontmatter.path) {
    return frontmatter.path
  }

  return [parent.sourceInstanceName, parent.name].join(`/`)
}

const PostLink = ({ post }) => {
  const path = toPath(post)

  return (
    <Link to={path}>
      <h3>{post.frontmatter.title}</h3>
    </Link>
  )
}

export default PostLink
