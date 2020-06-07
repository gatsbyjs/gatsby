import * as React from "react"

import Layout from "../components/layout"

const GlobalStyle = () => (
  <Layout>
    <h1 data-testid="global-plugin-style">
      This text should have a large z-index (via `gatsby-plugin-global-style`)
    </h1>
    <h2 data-testid="global-style">
      This text should have a large z-index (via root-level `gatsby-browser.js`)
    </h2>
  </Layout>
)

export default GlobalStyle
