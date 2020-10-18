import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => (
  <>
    <h1 data-testid="title">{data.site.siteMetadata.title}</h1>
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
