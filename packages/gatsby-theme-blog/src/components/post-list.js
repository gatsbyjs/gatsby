import React from "react"

import PostLink from "./post-link"

const PostList = ({ posts }) => (
  <>
    {posts.map(({ node }) => (
      <PostLink key={node.slug} {...node} />
    ))}
  </>
)

export default PostList
