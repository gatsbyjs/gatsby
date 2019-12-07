import React from "react"
import { StaticQuery, graphql } from "gatsby"

export default ({ element }) => (
  <StaticQuery
    query={graphql`
      query MetaQuery {
        site {
          siteMetadata {
            title
            author
          }
        }
      }
    `}
    render={({
      site: {
        siteMetadata: { title, author },
      },
    }) => (
      <div>
        {element}
        <span>{title}</span>
        <span>{author}</span>
      </div>
    )}
  />
)
