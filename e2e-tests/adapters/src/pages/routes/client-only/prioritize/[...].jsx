import React from "react"
import Layout from "../../../../components/layout"

const ClientOnlyPrioritizeMatchPath = props => (
  <Layout>
    <h1 data-testid="title">client-only/prioritize matchpath</h1>
    <p data-testid="params">{props.params["*"]}</p>
  </Layout>
)

export const Head = () => <title>Client-Only Prioritize Matchpath</title>

export default ClientOnlyPrioritizeMatchPath
