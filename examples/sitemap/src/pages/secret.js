import React from "react"
import Layout from "../components/layout"

const Secret = () => (
  <Layout>
    <div>
      <h1>Secret page</h1>
      <p>This page should be excluded from sitemap.xml</p>
    </div>
  </Layout>
)

export default Secret
