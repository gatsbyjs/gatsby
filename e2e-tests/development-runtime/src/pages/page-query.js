import React from "react"
import { graphql } from "gatsby"

function PageQuery({ data }) {
  return (
    <p data-testid="hot">
      {data.site.siteMetadata.title}: {data.site.siteMetadata.author}
    </p>
  )
}

export const query = graphql`
  {
    site {
      siteMetadata {
        # %AUTHOR%
        title
      }
    }
  }
`

export default PageQuery
