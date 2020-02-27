import React, { Component } from "react"
import { graphql } from "gatsby"
import CreatorsView from "../../views/creators"

class CreatorsPage extends Component {
  render() {
    const { location, data } = this.props
    return <CreatorsView data={data} location={location} title={`All`} />
  }
}

export default CreatorsPage

export const pageQuery = graphql`
  query {
    allCreatorsYaml {
      nodes {
        ...CreatorData
      }
    }
  }
`
