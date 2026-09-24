import React from "react"
import Layout from "../components/layout"

const ClientOnlyParamsCreatedWithGatsbyNode = props => (
  <Layout>
    <h1 data-testid="title">{props.pageContext.title}</h1>
    <p data-testid="params">{props.params.id}</p>
  </Layout>
)

export const Head = () => (
  <title>Client-Only Params created with gatsby-node</title>
)

export default ClientOnlyParamsCreatedWithGatsbyNode
