import React from "react"
import { graphql, useStaticQuery } from "gatsby"
import { QueryDataCachesView } from "../../../components/query-data-caches/view"

export default function StaticQueryCOtoBtoCOHistoryPageB({ path }) {
  const data = useStaticQuery(graphql`
    {
      queryDataCachesJson(
        selector: { eq: "static-query-CO-to-B-to-CO-history" }
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
      />
    </>
  )
}
