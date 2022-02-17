import * as React from "react"
import Layout from "../components/layout"

const GatsbyLocalPluginTSPage = ({ pageContext }) => {
  return (
    <Layout>
      <p data-testid="local-plugin-ts">{pageContext?.hello}</p>
    </Layout>
  )
}

export default GatsbyLocalPluginTSPage
