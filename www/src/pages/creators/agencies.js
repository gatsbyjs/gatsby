import React, { Component } from "react"
import { graphql } from "gatsby"
import CreatorsView from "../../views/creators"

class AgenciesPage extends Component {
  render() {
    const { location, data } = this.props
    return <CreatorsView location={location} data={data} title={`Agencies`} />
  }
}

export default AgenciesPage

export const pageQuery = graphql`
  query {
    allCreatorsYaml(filter: { type: { eq: "agency" } }) {
      edges {
        node {
          ...CreatorData
        }
      }
    }
  }
`
