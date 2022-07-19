import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"

const Redirect = () => (
  <Layout>
    <p>This should be at /pt/redirect-me/</p>
  </Layout>
)

export const Head = () => <SEO title="Redirect" />

export default Redirect
