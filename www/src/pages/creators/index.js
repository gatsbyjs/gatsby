import React from "react"
import { graphql } from "gatsby"
import CreatorsView from "../../views/creators"

export function CreatorsPage({ location, data }) {
  return <CreatorsView data={data} location={location} title={`All`} />
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
