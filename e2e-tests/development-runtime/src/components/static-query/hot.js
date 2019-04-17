import React from "react"
import { StaticQuery, graphql } from "gatsby"

function SupaHotFire(props) {
  return (
    <StaticQuery
      query={graphql`
        query {
          site {
            siteMetadata {
              # %AUTHOR%
              title
            }
          }
        }
      `}
      render={data => (
        <p {...props}>
          {data.site.siteMetadata.title}: {data.site.siteMetadata.author}
        </p>
      )}
    />
  )
}

export default SupaHotFire
