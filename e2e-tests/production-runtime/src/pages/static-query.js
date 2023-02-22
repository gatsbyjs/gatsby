import React, { useContext } from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"
import * as StaticQuery from "../components/static-query"
import * as UseStaticQuery from "../components/static-query/use-static-query"

const StaticQueryPage = () => {
  return (
    <Layout>
      <h1>
        <code>StaticQuery</code>
      </h1>
      <StaticQuery.ExportedVariable data-testid="exported" />
      <StaticQuery.Variable data-testid="variable" />
      <StaticQuery.Inline data-testid="inline" />
      <h2>
        <code>useStaticQuery</code>
      </h2>
      <UseStaticQuery.Inline data-testid="use-static-query-inline" />
      <UseStaticQuery.Variable data-testid="use-static-query-variable" />
      <UseStaticQuery.ExportedVariable data-testid="use-static-query-exported" />
      <UseStaticQuery.Destructuring data-testid="use-static-query-destructuring" />
      <UseStaticQuery.MJS data-testid="use-static-query-mjs" />
    </Layout>
  )
}

export const Head = () => <Seo />

export default StaticQueryPage
