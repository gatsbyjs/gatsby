import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"

const IndexPage = () => (
  <Layout>
    <h1>Gatsby Contentful test</h1>
    <h2>
      Please navigate to <Link to="/gatsby-image">/gatsby-image</Link>,{" "}
      <Link to="/gatsby-plugin-image">/gatsby-plugin-image</Link>.
    </h2>
  </Layout>
)

export default IndexPage
