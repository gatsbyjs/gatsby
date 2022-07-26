import React from "react"
import Layout from "../../components/layout"

export default props => (
  <Layout>
    <h1 data-testid="title">Client Dynamic Route</h1>
    <h2 data-testid="params">{props.params.id}</h2>
  </Layout>
)
