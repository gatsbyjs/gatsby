import React from "react"
import Layout from "../../components/layout"

const ClientDynamicID = props => (
  <Layout>
    <h1 data-testid="title">Client Dynamic Route</h1>
    <h2 data-testid="params">{props.params.id}</h2>
  </Layout>
)

export default ClientDynamicID
