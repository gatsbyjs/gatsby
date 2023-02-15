import React from "react"
import Layout from "../components/layout"

const SSRPage = ({ serverData }) => (
  <Layout>
    <div data-cy-id="getserverdata-result">{serverData.test}</div>
  </Layout>
)

export default SSRPage

export function getServerData() {
  return {
    props: {
      test: "getServerData used in contentful E2E test",
    },
  }
}
