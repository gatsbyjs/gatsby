import React, { Component } from "react"
import { graphql } from "gatsby"
import CommunityView from "../../views/community"

class AgenciesPage extends Component {
  render() {
    const { location, data } = this.props
    return <CommunityView location={location} data={data} title={`Agencies`} />
  }
}

export default AgenciesPage

export const pageQuery = graphql`
  query {
    allCreatorsYaml(filter: { type: { eq: "agency" } }) {
      edges {
        node {
          name
          description
          website
          github
          image {
            childImageSharp {
              fixed(width: 240, height: 240) {
                ...GatsbyImageSharpFixed
              }
            }
          }
          hiring
          portfolio
          fields {
            slug
          }
        }
      }
    }
  }
`
