import React from "react"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { RouteAnnouncement } from 'gatsby'

console.log(RouteAnnouncement)

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <RouteAnnouncement><h1>Welcome</h1></RouteAnnouncement>
    <p>
      If you hit "tab" and activate the skip link, the next tab should go to
      "Gatsby" in the footer.
    </p>
    <p>Welcome to your new Gatsby site.</p>
  </Layout>
)

export default IndexPage
