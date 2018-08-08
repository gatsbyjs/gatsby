import React, { Component } from "react"
import { graphql } from "gatsby"

import ShowcaseView from "../views/showcase"

class ShowcasePage extends Component {
  render() {
    const data = this.props.data
    const location = this.props.location

    return <ShowcaseView data={data} location={location} />
  }
}

export default ShowcasePage

export const showcaseQuery = graphql`
  query {
    featured: allSitesYaml(filter: { featured: { eq: true } }) {
      edges {
        node {
          id
          title
          categories
          built_by
          fields {
            slug
          }
          childScreenshot {
            screenshotFile {
              childImageSharp {
                sizes(maxWidth: 512) {
                  ...GatsbyImageSharpSizes
                }
              }
            }
          }
        }
      }
    }
    allSitesYaml(filter: { main_url: { ne: null } }) {
      edges {
        node {
          id
          featured
          title
          categories
          built_by
          description
          main_url
          built_by_url
          source_url
          childScreenshot {
            screenshotFile {
              childImageSharp {
                resolutions(width: 282, height: 211) {
                  ...GatsbyImageSharpResolutions
                }
              }
            }
          }
          fields {
            slug
          }
        }
      }
    }
  }
`
