import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  if (!data?.allTest?.nodes) {
    throw new Error("Wrong data: " + JSON.stringify(data))
  }
  return <div>{JSON.stringify(data)}</div>
}

export const query = graphql`
  query($fooBarArray: [String!], $sort: TestSortInput) {
    allTest(
      filter: { fooBar: { nin: $fooBarArray } }
      sort: $sort
      limit: 100
    ) {
      nodes {
        nodeNum
        text
      }
    }
  }
`
