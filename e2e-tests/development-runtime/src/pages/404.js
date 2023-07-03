import React from "react"
import { graphql, Link, Slice } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

import { QueryDataCachesView } from "../components/query-data-caches/view"
import { use404LinkStaticQuery } from "../components/query-data-caches/static-query-404-link"
import { use404HistoryStaticQuery } from "../components/query-data-caches/static-query-404-history"

// FIXME: implementation showing 404 page is special cased and doesn't have all the props that other pages have
// in particular `path` and `uri` props are missing. This is just a hack to show canonical path of the 404 page
// in QueryDataCachesView helper component
const path = `/404.html`

function QueryDataCachesWrapper({ data, slug, prefix, ...rest }) {
  return (
    <fieldset>
      <legend>{slug}</legend>
      <QueryDataCachesView
        data={{ queryDataCachesJson: data }}
        pageType="404"
        path={path}
        prefix={prefix}
        {...rest}
      />

      {/* <pre>{JSON.stringify({ data, path }, null, 2)}</pre> */}
    </fieldset>
  )
}

const NotFoundPage = ({ data }) => (
  <Layout>
    <h1 data-testid="page-title">NOT FOUND</h1>
    <p>You just hit a route that does not exist... the sadness.</p>
    <fieldset>
      <legend>query-data-caches</legend>
      <QueryDataCachesWrapper
        data={data.pageLink}
        slug="page-query-404-to-B-to-404-link"
        dataType="page-query"
        prefix="page-link-"
      />
      <QueryDataCachesWrapper
        data={use404LinkStaticQuery().queryDataCachesJson}
        slug="static-query-404-to-B-to-404-link"
        dataType="static-query"
        prefix="static-link-"
      />
      <QueryDataCachesWrapper
        data={data.pageHistory}
        slug="page-query-404-to-B-to-404-history"
        dataType="page-query"
        prefix="page-history-"
      />
      <QueryDataCachesWrapper
        data={use404HistoryStaticQuery().queryDataCachesJson}
        slug="static-query-404-to-B-to-404-history"
        dataType="static-query"
        prefix="static-history-"
      />
      <Link to="../page-B" data-testid="page-b-link">
        Go to page B
      </Link>
    </fieldset>
    <Slice alias="mappedslice" />
  </Layout>
)
export const Head = () => <Seo title="404: Not found" />

export default NotFoundPage

export const query = graphql`
  {
    pageLink: queryDataCachesJson(
      selector: { eq: "page-query-404-to-B-to-404-link" }
    ) {
      ...QueryDataCachesFragmentInitialPage
    }
    pageHistory: queryDataCachesJson(
      selector: { eq: "page-query-404-to-B-to-404-history" }
    ) {
      ...QueryDataCachesFragmentInitialPage
    }
  }
`
