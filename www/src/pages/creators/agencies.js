import React from "react"
import { graphql } from "gatsby"
import CreatorsView from "../../views/creators"

export default function AgenciesPage({ location, data }) {
  return <CreatorsView location={location} data={data} title={`Agencies`} />
}

export const pageQuery = graphql`
  query {
    allCreatorsYaml(filter: { type: { eq: "agency" } }) {
      nodes {
        ...CreatorData
      }
    }
  }
`
