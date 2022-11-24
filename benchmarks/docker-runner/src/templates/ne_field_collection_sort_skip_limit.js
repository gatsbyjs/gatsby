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
  query ($id: String!, $skip: Int!) {
    allTest(
      filter: { idClone: { ne: $id } }
      sort: { fields: [number3], order: [ASC] }
      limit: 10
      skip: $skip
    ) {
      nodes {
        id
        fooBar
      }
    }
    workerInfo(label: "ne-field-collection-sort-skip-limit")
  }
`
