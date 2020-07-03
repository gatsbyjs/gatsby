import React from "react"
import { graphql } from "gatsby"
import CreatorsView from "../../views/creators"

export default function CompaniesPage({ location, data }) {
  return <CreatorsView data={data} location={location} title={`Companies`} />
}

export default CompaniesPage

export const pageQuery = graphql`
  query {
    allCreatorsYaml(filter: { type: { eq: "company" } }) {
      nodes {
        ...CreatorData
      }
    }
  }
`
