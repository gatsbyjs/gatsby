import React from "react"

import Posts from "../components/posts"

export default ({ pathContext: { posts, siteTitle }, location }) => {
  return <Posts location={location} posts={posts} siteTitle={siteTitle} />
}
