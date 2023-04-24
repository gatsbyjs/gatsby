import React from "react"
import { graphql } from "gatsby"

export default function Post({ data, children }) {
  return (
    <main>
      <h1 data-testid="post-template">{data.post.frontmatter.title}</h1>
      {children}
    </main>
  )
}

export const Head = () => <title>Post</title>

export const query = graphql`
  query($id: String!) {
    post: mdx(id: { eq: $id }) {
      frontmatter {
        title
      }
    }
  }
`
