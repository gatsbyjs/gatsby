import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => (
  <>
    <p data-testid="title">{data.site.siteMetadata.title}</p>
    <p data-testid="author">{data.site.siteMetadata.author}</p>
  </>
)

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        author
      }
    }
  }
`
