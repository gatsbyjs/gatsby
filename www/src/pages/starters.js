import React, { Component } from "react"
import { graphql } from "gatsby"

import ShowcaseView from "../views/starter-showcase"

class ShowcasePage extends Component {
  render() {
    const data = this.props.data
    const location = this.props.location

    return <ShowcaseView data={data} location={location} />
    // return <div>hi</div>
  }
}

export default ShowcasePage

export const showcaseQuery = graphql`
  query SiteShowcaseQuery {
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
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      limit: 1000
      filter: { fileAbsolutePath: { regex: "/startersData/", ne: null } }
    ) {
      edges {
        node {
          id
          fileAbsolutePath
          frontmatter {
            demo
            repo
            tags
            features
          }
          fields {
            anchor
            slug
            title
            package
            starterShowcase {
              stub
              gatsbyDependencies
              lastUpdated
              description
              githubFullName
              owner {
                avatar_url
              }
              githubData {
                repoMetadata {
                  full_name
                  pushed_at
                  name
                  owner {
                    login
                  }
                }
              }
              stars
            }
          }
        }
      }
    }
  }
`
