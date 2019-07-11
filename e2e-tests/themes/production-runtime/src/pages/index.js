import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => (
  <>
    <p data-testid="title">{data.site.siteMetadata.title}</p>
    <p data-testid="description">{data.site.siteMetadata.description}</p>
  </>
)

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
        description
      }
    }
  }
`
