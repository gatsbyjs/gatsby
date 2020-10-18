import React from "react"
import { graphql } from "gatsby"

import StarterLibraryView from "../views/starter-library"

export default function StarterLibraryWrapper({ data, location }) {
  return <StarterLibraryView data={data} location={location} />
}

export const showcaseQuery = graphql`
  query SiteShowcaseQuery {
    allStartersYaml(filter: { fields: { hasScreenshot: { eq: true } } }) {
      nodes {
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
`
