import * as React from "react"
import { StaticQuery, graphql } from "gatsby"

function Bio() {
  return (
    <StaticQuery
      query={bioQuery}
      render={data => (
        <div>
          <p data-testid="bio">A site by {data.site.siteMetadata.author}</p>
        </div>
      )}
    />
  )
}

export const bioQuery = graphql`
  {
    site {
      siteMetadata {
        author
      }
    }
  }
`

export default Bio
