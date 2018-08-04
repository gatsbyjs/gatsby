import React, { Component } from "react"
import { graphql } from "gatsby"

import ShowcaseView from "../views/starter-showcase"

class ShowcasePage extends Component {
  render() {
    const data = this.props.data
    const location = this.props.location
    const history = this.props.history

    return <ShowcaseView data={data} location={location} history={history} />
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
            fluid(maxWidth: 280, maxHeight: 230) {
              ...GatsbyImageSharpFluid
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
