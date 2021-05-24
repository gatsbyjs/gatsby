import * as React from "react"
import { Link } from "gatsby"
import { StaticImage } from "gatsby-plugin-image"

import Layout from "../components/layout"
import Seo from "../components/seo"

const IndexPage = () => (
  <Layout>
    <Seo title="Home" />
    <h1>Hi people</h1>
    <p>
      <Link to="/users/1">user 1</Link> <br />
      <Link to="/users/2">user 2</Link> <br />
    </p>
  </Layout>
)

export default IndexPage
