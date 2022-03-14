import React from "react"
import Layout from "../components/layout"

const QueryParams = ({ location }) => (
  <Layout>
    <p data-testid="location.search">{location.search}</p>
  </Layout>
)

export default QueryParams
