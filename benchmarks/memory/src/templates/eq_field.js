import React from "react"
import { graphql } from "gatsby"

export default function Home({ data }) {
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export const q = graphql`
  query ($id: String!) {
    test(idClone: { eq: $id }) {
      id
      fooBar
    }
    workerInfo(label: "eq-field")
  }
`
