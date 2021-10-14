import React from "react"
import { graphql } from "gatsby"

export default function DepPageQueryAlternativePage({ data }) {
  return (
    <>
      <h1>Alternative template for depPageQuery</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </>
  )
}

export const query = graphql`
  query($id: String) {
    depPageQuery(id: { eq: $id }) {
      label
    }
  }
`
