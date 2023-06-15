import React from "react"
import Layout from "../../../../components/layout"

const ClientOnlyWildcard = props => (
  <Layout>
    <h1 data-testid="title">client-only/wildcard</h1>
    <p data-testid="params">{props.params["*"]}</p>
  </Layout>
)

export const Head = () => <title>Client-Only Wildcard</title>

export default ClientOnlyWildcard
