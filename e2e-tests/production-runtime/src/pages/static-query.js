import React from 'react'

import Layout from '../components/layout'
import * as StaticQuery from '../components/static-query'
import * as UseVariableQuery from '../components/static-query/use-static-query'

const StaticQueryPage = () => (
  <Layout>
    <h1>
      <code>StaticQuery</code> Examples
    </h1>
    <StaticQuery.ExportedVariable data-testid="exported" />
    <StaticQuery.Variable data-testid="variable" />
    <StaticQuery.Inline data-testid="inline" />
    <h2>
      <code>useStaticQuery</code>
    </h2>
    <UseVariableQuery.Inline data-testid="use-static-query-inline" />
    <UseVariableQuery.Variable data-testid="use-static-query-variable" />
    <UseVariableQuery.ExportedVariable data-testid="use-static-query-exported" />
    <UseVariableQuery.Destructuring data-testid="use-static-query-destructuring" />
  </Layout>
)

export default StaticQueryPage
