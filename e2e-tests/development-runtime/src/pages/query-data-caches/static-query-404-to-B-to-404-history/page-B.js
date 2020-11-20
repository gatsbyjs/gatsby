import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { QueryDataCachesView } from "../../../components/query-data-caches/view"

export default function StaticQuery404toBto404HistoryPageB({ path }) {
  const data = useStaticQuery(graphql`
    {
      queryDataCachesJson(
        selector: { eq: "static-query-404-to-B-to-404-history" }
      ) {
        ...QueryDataCachesFragmentSecondPage
      }
    }
  `)

  return (
    <>
      <QueryDataCachesView
        data={data}
        pageType="B"
        dataType="static-query"
        path={path}
        prefix="static-history-"
      />
    </>
  )
}
