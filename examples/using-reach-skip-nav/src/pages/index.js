import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <h1>
      If you hit "tab" and activate the skip link, the next tab should go to
      "Gatsby" in the footer.
    </h1>
    <p>Welcome to your new Gatsby site.</p>
  </Layout>
)

export default IndexPage
