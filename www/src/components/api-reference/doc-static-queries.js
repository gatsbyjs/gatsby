import React from "react"
import { graphql, StaticQuery } from "gatsby"

export const DocumentationAndApiFragment = graphql`
  fragment DocFragment on DocumentationJs {
    availableIn
    codeLocation {
      start {
        line
      }
      end {
        line
      }
    }
    ...DocumentationFragment
  }
`

// list fragments in transformer sharp
export const GraphqlFragmentQuery = ({ children }) => (
  <StaticQuery
    query={graphql`
      query GraphqlFragmentQuery {
        allFile(
          filter: {
            relativePath: { in: ["gatsby-transformer-sharp/src/fragments.js"] }
          }
        ) {
          nodes {
            relativePath
            childrenDocumentationJs {
              ...DocFragment
            }
          }
        }
      }
    `}
    render={data => children(data)}
  />
)
