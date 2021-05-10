import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  if (!data?.allTest?.nodes) {
    throw new Error("Wrong data")
  }
  return <div>{JSON.stringify(data)}</div>
}

export const query = graphql`
  query($pageNum: Int, $sort: TestSortInput) {
    allTest(
      filter: { nodeNumReversed: { lt: $pageNum } }
      sort: $sort
      limit: 5
    ) {
      nodes {
        nodeNum
        text
      }
    }
  }
`
