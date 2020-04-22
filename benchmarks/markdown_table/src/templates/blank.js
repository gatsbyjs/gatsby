import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  const markdown = data.fakeMarkdown.childMarkdownRemark
  return (
    <div>
      <h1>{markdown.frontmatter.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: markdown.html }} />
    </div>
  )
}

export const query = graphql`
  query testing($id: String!) {
    fakeMarkdown(id: { eq: $id }) {
      childMarkdownRemark {
        frontmatter {
          title
        }
        html
      }
    }
  }
`
