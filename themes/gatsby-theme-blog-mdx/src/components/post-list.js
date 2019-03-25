import React from "react"

import PostLink from "./post-link"

const PostList = ({ data }) => {
  const {
    allMdx: { edges: posts },
  } = data

  return (
    <>
      {posts.map(post => (
        <PostLink key={post.node.id} post={post.node} />
      ))}
    </>
  )
}

export default PostList
