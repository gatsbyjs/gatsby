import React from "react"
import { StaticQuery, graphql } from "gatsby"

export default function Inline() {
  return (
    <div>
      <StaticQuery
        query={graphql`
          query {
            site {
              siteMetadata {
                title
              }
            }
          }
        `}
        render={data => (
          <header>
            <h1>{data.site.siteMetadata.title}</h1>
          </header>
        )}
      />
    </div>
  )
}
