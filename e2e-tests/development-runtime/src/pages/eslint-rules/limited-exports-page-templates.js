import React from "react"
import { graphql } from "gatsby"

function PageQuery({ data }) {
  return (
    <div>
      <h1 data-testid="title">Limited Exports Page Templates. ESLint Rule</h1>
      <p data-testid="hot">{data.site.siteMetadata.title}</p>
    </div>
  )
}

// export function notAllowed() {}

export const query = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`

export default PageQuery
