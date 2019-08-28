import React from "react"
import { graphql } from "gatsby"
import StarterLibraryView from "../views/starter-library"

const StarterLibraryWrapper = props => {
  const data = props.data
  const location = props.location
  return <StarterLibraryView data={data} location={location} />
}
export default StarterLibraryWrapper
export const showcaseQuery = graphql`
  query SiteShowcaseQuery {
    allStartersYaml(filter: { fields: { hasScreenshot: { eq: true } } }) {
      edges {
        node {
          id
          fields {
            starterShowcase {
              slug
              stub
              description
              stars
              lastUpdated
              owner
              name
              githubFullName
              gatsbyMajorVersion
              allDependencies
              gatsbyDependencies
              miscDependencies
            }
          }
          url
          repo
          description
          tags
          features
          internal {
            type
          }
          childScreenshot {
            screenshotFile {
              childImageSharp {
                fluid(maxWidth: 512) {
                  ...GatsbyImageSharpFluid_noBase64
                }
              }
            }
          }
        }
      }
    }
  }
`
