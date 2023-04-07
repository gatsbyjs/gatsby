import React from "react"
import { graphql } from "gatsby"

export default ({ data }) => {
  if (!data?.allTest?.nodes) {
    throw new Error("Wrong data: " + JSON.stringify(data))
  }
  return <div>{JSON.stringify(data)}</div>
}

export const query = graphql`
  query($pageNum: Int, $sort: TestSortInput, $count: Boolean!) {
    allTest(filter: { randomPage: { lt: $pageNum } }, sort: $sort, limit: 100) {
      nodes {
        nodeNum
        text
      }
      totalCount @include(if: $count)
    }
  }
`
