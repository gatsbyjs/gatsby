import React from "react"
import { graphql, Link } from "gatsby"

export default ({ data }) => (
  <>
    <p data-testid="title">{data.site.siteMetadata.title}</p>
    <p data-testid="author">{data.site.siteMetadata.author}</p>

    <Link to="/page-2">Go to page 2</Link>
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
