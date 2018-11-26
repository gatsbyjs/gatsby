import React from "react"
import { graphql } from "gatsby"
import ReactMarkdown from "react-markdown"
import dateformat from "dateformat"

export default ({ data }) => {
  const blogPost = data.cms.blogPost
  return (
    <div>
      <h1>{blogPost.title}</h1>
      <div>Posted at: {dateformat(blogPost.createdAt, `fullDate`)}</div>
      <ReactMarkdown source={blogPost.post} />
    </div>
  )
}

export const query = graphql`
  query($blogId: ID!) {
    cms {
      blogPost(where: { id: $blogId }) {
        title
        createdAt
        post
      }
    }
  }
`
