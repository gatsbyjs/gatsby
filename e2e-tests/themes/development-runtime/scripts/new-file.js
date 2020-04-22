import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => (
  <>
    <p data-testid="description">{data.site.siteMetadata.description}</p>
    <p data-testid="author">{data.site.siteMetadata.author}</p>
  </>
)

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        description
        author
      }
    }
  }
`
