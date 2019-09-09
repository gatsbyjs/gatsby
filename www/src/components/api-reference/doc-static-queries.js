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

// data for the graphql-api page
export const GraphqlApiQuery = ({ children }) => (
  <StaticQuery
    query={graphql`
      query FragmentsQuery {
        transformerSharp: allFile(
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
        contentfulFragments: allFile(
          filter: {
            relativePath: { in: ["gatsby-source-contentful/src/fragments.js"] }
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
