import React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"
import { QueryDataCachesView } from "../../../components/query-data-caches/view"

export default function StaticQueryCOtoBtoCOHistoryPageA({ path }) {
  const data = useStaticQuery(graphql`
    {
      queryDataCachesJson(
        selector: { eq: "static-query-CO-to-B-to-CO-history" }
      ) {
        ...QueryDataCachesFragmentInitialPage
      }
    }
  `)

  return (
    <>
      <QueryDataCachesView
        data={data}
        pageType="client-only"
        dataType="static-query"
        path={path}
      />
      <Link to="../page-B" data-testid="page-b-link">
        Go to page B
      </Link>
    </>
  )
}
