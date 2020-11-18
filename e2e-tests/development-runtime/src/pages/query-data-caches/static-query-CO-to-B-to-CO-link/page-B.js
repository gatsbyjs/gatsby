import React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"
import { QueryDataCachesView } from "../../../components/query-data-caches/view"

export default function StaticQueryCOtoBtoCOLinkPageB({ path }) {
  const data = useStaticQuery(graphql`
    {
      queryDataCachesJson(selector: { eq: "static-query-CO-to-B-to-CO-link" }) {
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
      <Link to="../page-A" data-testid="page-a-link">
        Go back to page A
      </Link>
    </>
  )
}
