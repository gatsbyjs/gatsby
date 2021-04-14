import React from "react"
import { Link, graphql, useStaticQuery } from "gatsby"
import { QueryDataCachesView } from "../../../components/query-data-caches/view"

export default function StaticQuery404toBto404LinkPageB({ path }) {
  const data = useStaticQuery(graphql`
    {
      queryDataCachesJson(
        selector: { eq: "static-query-404-to-B-to-404-link" }
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
        prefix="static-link-"
      />
      <Link to="../page-A" data-testid="page-a-link">
        Go back to page A
      </Link>
    </>
  )
}
