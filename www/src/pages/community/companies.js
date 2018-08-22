import React, { Component } from "react"
import { graphql } from "gatsby"
import CommunityView from "../../views/community"

class CompaniesPage extends Component {
  render() {
    const { location, data } = this.props
    console.log(data)
    return <CommunityView data={data} location={location} title={`Companies`} />
  }
}

export default CompaniesPage

export const pageQuery = graphql`
  query {
    allCreatorsYaml(filter: { type: { eq: "company" } }) {
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
