import React, { Component } from "react"
import { graphql } from "gatsby"
import CommunityView from "../../views/community"

class CommunityPage extends Component {
  render() {
    const { location, data } = this.props
    console.log(data)
    return <CommunityView data={data} location={location} title={`Community`} />
  }
}

export default CommunityPage

export const pageQuery = graphql`
  query {
    allCreatorsYaml {
      edges {
        node {
          name
          type
          description
          website
          github
          for_hire
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
