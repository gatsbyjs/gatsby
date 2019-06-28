import React from "react"

import Posts from "../components/posts"

export default ({ pathContext: { posts, siteTitle }, location }) => (
  <Posts location={location} posts={posts} siteTitle={siteTitle} />
)
