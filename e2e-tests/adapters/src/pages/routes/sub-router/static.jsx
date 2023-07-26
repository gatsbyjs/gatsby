import * as React from "react"
import Layout from "../../../components/layout"

const StaticPage = () => {
  return (
    <Layout>
      <h1>Static</h1>
      <pre data-testid="dom-marker">[client-only-path] static-sibling</pre>
    </Layout>
  )
}

export default StaticPage

export const Head = () => <title>Static</title>