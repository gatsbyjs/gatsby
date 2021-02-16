import React from "react"
import { graphql } from "gatsby"

export default function DepPageQueryPage({ data }) {
  return <pre>{JSON.stringify(data, null, 2)}</pre>
}

export const query = graphql`
  query($id: String) {
    depPageQuery(id: { eq: $id }) {
      label
    }
  }
`
