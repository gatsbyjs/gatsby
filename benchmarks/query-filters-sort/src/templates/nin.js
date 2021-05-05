import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  if (!data?.allTest?.nodes) {
    throw new Error("Invalid data")
  }
  return <div>{JSON.stringify(data)}</div>
}

export const query = graphql`
  query($fooBarValues: [String!], $sort: TestSortInput) {
    allTest(filter: { testIn: { nin: $fooBarValues } }, sort: $sort, limit: 5) {
      nodes {
        nodeNum
        text
      }
    }
  }
`
