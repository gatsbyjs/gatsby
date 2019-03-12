import React from "react"

import Layout from "../components/layout"
import * as StaticQuery from "../components/static-query"
import * as UseStaticQuery from "../components/static-query/use-static-query"

const StaticQueryPage = () => (
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
    <h2>
      {new Array(5).fill(undefined).map((_, index) => (
        <span
          key={index}
          role="img"
          aria-label="It's getting hot in here emoji"
        >
          🔥
        </span>
      ))}
    </h2>
    <StaticQuery.Hot data-testid="hot" />
    <UseStaticQuery.Hot data-testid="use-static-query-hot" />
  </Layout>
)

export default StaticQueryPage
