import React from "react"
import { Link } from "gatsby"
import { QueryDataCachesView } from "../../../components/query-data-caches/view"
import { useDataForAddingStaticQueryTest } from "../../../components/query-data-caches/adding-static-query-blank"

export default function AddingStaticQueryToPageTemplatePageA({ path }) {
  const data = useDataForAddingStaticQueryTest()
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
