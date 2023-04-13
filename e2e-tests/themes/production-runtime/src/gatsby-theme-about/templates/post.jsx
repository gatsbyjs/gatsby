import React from "react"
import { graphql } from "gatsby"

export default function Post({ data, children }) {
  return (
    <main>
      <h1 data-testid="post-template">{`${data.post.frontmatter.titleAlias} - Shadowed`}</h1>
      {children}
    </main>
  )
}

export const query = graphql`
  query($id: String!) {
    post: mdx(id: { eq: $id }) {
      frontmatter {
        titleAlias: title
      }
    }
  }
`
