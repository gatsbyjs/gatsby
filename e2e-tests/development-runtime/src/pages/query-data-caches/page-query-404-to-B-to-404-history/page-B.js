import React from "react"
import { graphql } from "gatsby"
import { QueryDataCachesView } from "../../../components/query-data-caches/view"

export default function PageQuery404toBto404HistoryPageB({ data, path }) {
  return (
    <>
      <QueryDataCachesView
        data={data}
        pageType="B"
        dataType="page-query"
        path={path}
        prefix="page-history-"
      />
    </>
  )
}

export const query = graphql`
  {
    queryDataCachesJson(
      selector: { eq: "page-query-404-to-B-to-404-history" }
    ) {
      ...QueryDataCachesFragmentSecondPage
    }
  }
`
