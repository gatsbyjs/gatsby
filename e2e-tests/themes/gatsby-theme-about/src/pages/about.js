import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => (
  <h1 data-testid="title">{data.site.siteMetadata.title}</h1>
)

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
  }
`
