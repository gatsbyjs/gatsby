import React from "react"
import Layout from "../../../../components/layout"

const NestedClientOnlyRoute = props => (
  <Layout>
    <h1 data-testid="title">Nested Dynamic Route</h1>
    <h2 data-testid="params-brand">{props.params.brand}</h2>
    <h2 data-testid="params-product">{props.params.product}</h2>
  </Layout>
)

export default NestedClientOnlyRoute
