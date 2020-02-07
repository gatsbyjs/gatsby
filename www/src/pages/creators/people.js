import React, { Component } from "react"
import { graphql } from "gatsby"
import CreatorsView from "../../views/creators"

class PeoplePage extends Component {
  render() {
    const { location, data } = this.props
    return <CreatorsView data={data} location={location} title={`People`} />
  }
}

export default PeoplePage

export const pageQuery = graphql`
  query {
    allCreatorsYaml(filter: { type: { eq: "individual" } }) {
      edges {
        node {
          ...CreatorData
        }
      }
    }
  }
`
