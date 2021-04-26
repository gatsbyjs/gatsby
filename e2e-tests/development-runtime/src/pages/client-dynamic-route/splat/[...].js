import React from "react"
import Layout from "../../../components/layout"

const SplatRoute = props => (
  <Layout>
    <h1 data-testid="title">SPLAT!</h1>
    <h2 data-testid="splat">{props.params["*"]}</h2>
  </Layout>
)

export default SplatRoute
