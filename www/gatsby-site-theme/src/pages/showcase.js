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
    featured: allSitesYaml(
      filter: {
        featured: { eq: true }
        fields: { hasScreenshot: { eq: true } }
      }
    ) {
      nodes {
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
              fluid(maxWidth: 512) {
                ...GatsbyImageSharpFluid_noBase64
              }
            }
          }
        }
      }
    }
    allSitesYaml(
      filter: {
        main_url: { ne: null }
        fields: { hasScreenshot: { eq: true } }
      }
    ) {
      nodes {
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
              ...ShowcaseThumbnailFragment_item
            }
          }
        }
        fields {
          slug
        }
      }
    }
  }
`
