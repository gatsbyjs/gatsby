import React from "react"

import Layout from "../components/layout"
import SEO from "../components/seo"

const RedirectSearchHash = () => (
  <Layout>
    <p>This should be a page that also has search & hash</p>
  </Layout>
)

export const Head = () => <SEO title="Redirect with Search & Hash" />

export default RedirectSearchHash
