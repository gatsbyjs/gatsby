import React, { Component } from "react"
import { graphql } from "gatsby"
import CommunityView from "../../views/community"

class AgenciesPage extends Component {
  render() {
    const { location, data } = this.props
    console.log(data)
    return <CommunityView location={location} title={`Agencies`} />
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
