import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  if (!data?.allTest?.nodes) {
    throw new Error("Bad query result")
  }
  return <div>{JSON.stringify(data)}</div>
}

export const query = graphql`
  query($pageNumAsStr: String!, $sort: TestSortInput) {
    allTest(filter: { testEq: { eq: $pageNumAsStr } }, sort: $sort, limit: 5) {
      nodes {
        nodeNum
        text
      }
    }
  }
`
