import React from "react"
import Layout from "../../../components/layout"

const FakeDataTitleName = props => (
  <Layout>
    <h1 data-testid="title">Named SPLAT Nested with Collection Route!</h1>
    <h2 data-testid="splat">{props.params.name}</h2>
  </Layout>
)

export default FakeDataTitleName
