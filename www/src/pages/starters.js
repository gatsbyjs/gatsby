import React, { Component } from "react"
import { graphql } from "gatsby"

import ShowcaseView from "../views/starter-showcase"

class ShowcasePage extends Component {
  render() {
    const data = this.props.data
    const location = this.props.location

    return <ShowcaseView data={data} location={location} />
  }
}

export default ShowcasePage

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
              error
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
