import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  if (!data?.allTest?.nodes) {
    throw new Error("Wrong data: " + JSON.stringify(data))
  }
  return <div>{JSON.stringify(data)}</div>
}

export const query = graphql`
  query(
    $pageNum: Int
    $pageNumPlus1000: Int
    $sort: TestSortInput
    $count: Boolean!
  ) {
    allTest(
      filter: { randomPage: { gt: $pageNum, lt: $pageNumPlus1000 } }
      sort: $sort
      limit: 100
    ) {
      nodes {
        nodeNum
        text
      }
      totalCount @include(if: $count)
    }
  }
`
