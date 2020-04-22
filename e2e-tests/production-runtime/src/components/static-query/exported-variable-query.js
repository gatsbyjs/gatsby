import * as React from "react"
import { StaticQuery, graphql } from "gatsby"

function ExportedVariable(props) {
  return (
    <StaticQuery
      query={nameQuery}
      render={data => <p {...props}>{data.site.siteMetadata.author}</p>}
    />
  )
}

export const nameQuery = graphql`
  {
    site {
      siteMetadata {
        author
      }
    }
  }
`

export default ExportedVariable
