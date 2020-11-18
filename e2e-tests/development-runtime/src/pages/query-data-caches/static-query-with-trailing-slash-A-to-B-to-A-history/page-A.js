import React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"
import { QueryDataCachesView } from "../../../components/query-data-caches/view"

export default function StaticQueryWithTrailingSlashAtoBtoAHistoryPageA({
  path,
}) {
  const data = useStaticQuery(graphql`
    {
      queryDataCachesJson(
        selector: { eq: "static-query-with-trailing-slash-A-to-B-to-A-history" }
      ) {
        ...QueryDataCachesFragmentInitialPage
      }
    }
  `)

  return (
    <>
      <QueryDataCachesView
        data={data}
        pageType="A"
        dataType="static-query"
        path={path}
      />
      <Link to="../page-B" data-testid="page-b-link">
        Go to page B
      </Link>
    </>
  )
}
