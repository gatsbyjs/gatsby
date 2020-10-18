import React from "react"
import { graphql } from "gatsby"
import CreatorsView from "../../views/creators"

export default function PeoplePage({ location, data }) {
  return <CreatorsView data={data} location={location} title={`People`} />
}

export const pageQuery = graphql`
  query {
    allCreatorsYaml(filter: { type: { eq: "individual" } }) {
      nodes {
        ...CreatorData
      }
    }
  }
`
