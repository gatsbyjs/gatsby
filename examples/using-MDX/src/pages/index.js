import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"

const IndexPage = () => (
  <Layout>
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby blog with MDX.</p>
    <Link to="/hello-world">Go to my first MDX page</Link>
  </Layout>
)

export default IndexPage
