import React, { Component } from "react"
import { graphql } from "gatsby"

import StartersView from "../views/starters"

class StartersPage extends Component {
  render() {
    const data = this.props.data
    const location = this.props.location

    return <StartersView data={data} location={location} />
  }
}

export default StartersPage

export const showcaseQuery = graphql`
  query SiteShowcaseQuery {
    allStartersYaml {
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
