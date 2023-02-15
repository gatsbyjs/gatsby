import React from "react"
import Layout from "../components/layout"

const SSRPage = ({ serverData }) => (
  <Layout>
    <div data-cy-id="getserverdata-result">{serverData}</div>
  </Layout>
)

export default SSRPage

export function getServerData() {
  return "getServerData used in contentful E2E test"
}