import React from "react"
import Layout from "../../../components/layout"

const ClientOnlyParams = props => (
  <Layout>
    <h1 data-testid="title">client-only</h1>
    <p data-testid="params">{props.params.id}</p>
  </Layout>
)

export const Head = () => <title>Client-Only Params</title>

export default ClientOnlyParams
