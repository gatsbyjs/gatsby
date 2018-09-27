import React, { Component } from "react"
import { graphql } from "gatsby"

<<<<<<< HEAD
import StartersView from "../views/starters"

class StartersPage extends Component {
=======
import StarterLibraryView from "../views/starter-library"

class StarterLibraryWrapper extends Component {
>>>>>>> [www/starters] file renaming away from showcase, toward library
  render() {
    const data = this.props.data
    const location = this.props.location

<<<<<<< HEAD
    return <StartersView data={data} location={location} />
  }
}

export default StartersPage

export const showcaseQuery = graphql`
  query SiteShowcaseQuery {
    allStartersYaml {
=======
    return <StarterLibraryView data={data} location={location} />
  }
}

export default StarterLibraryWrapper

export const starterLibraryQuery = graphql`
  query starterLibraryQuery {
    allFile(filter: { absolutePath: { regex: "/generatedScreenshots/" } }) {
      edges {
        node {
          name
          childImageSharp {
            ...ShowcaseThumbnailFragment_item
          }
        }
      }
    }
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 1000
      filter: { fileAbsolutePath: { regex: "/startersData/", ne: null } }
    ) {
>>>>>>> [www/starters] file renaming away from showcase, toward library
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
