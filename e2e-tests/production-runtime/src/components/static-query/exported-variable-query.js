import React from 'react'
import { StaticQuery, graphql } from 'gatsby'

function ExportedVariable(props) {
  return (
    <StaticQuery
      query={nameQuery}
      render={data => <p {...props}>{data.site.siteMetadata.author.name}</p>}
    />
  )
}

export const nameQuery = graphql`
  {
    site {
      siteMetadata {
        author {
          name
        }
      }
    }
  }
`

export default ExportedVariable
