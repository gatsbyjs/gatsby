import React from "react"
import { Link, graphql } from "gatsby"
import { QueryDataCachesView } from "../../../components/query-data-caches/view"

export default function PageQuery404toBto404LinkPageB({ data, path }) {
  return (
    <>
      <QueryDataCachesView
        data={data}
        pageType="B"
        dataType="page-query"
        path={path}
        prefix="page-link-"
      />
      <Link to="../page-A" data-testid="page-a-link">
        Go back to page A
      </Link>
    </>
  )
}

export const query = graphql`
  {
    queryDataCachesJson(selector: { eq: "page-query-404-to-B-to-404-link" }) {
      ...QueryDataCachesFragmentSecondPage
    }
  }
`
