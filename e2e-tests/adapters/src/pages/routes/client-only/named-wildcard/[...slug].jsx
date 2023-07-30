import React from "react"
import Layout from "../../../../components/layout"

const ClientOnlyNamedWildcard = props => (
  <Layout>
    <h1 data-testid="title">client-only/named-wildcard</h1>
    <p data-testid="params">{props.params.slug}</p>
  </Layout>
)

export const Head = () => <title>Client-Only Named Wildcard</title>

export default ClientOnlyNamedWildcard
