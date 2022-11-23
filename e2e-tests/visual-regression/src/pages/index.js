import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"

const IndexPage = () => (
  <Layout>
    <h1>Gatsby Image integration test</h1>
    <ul>
      <li>
        <Link to="/images/fixed">/images/fixed</Link>
      </li>
      <li>
        <Link to="/images/fixed-too-big">/images/fixed-too-big</Link>
      </li>
      <li>
        <Link to="/images/fullWidth">/images/fullWidth</Link>
      </li>
      <li>
        <Link to="/images/constrained">/images/constrained</Link>
      </li>
    </ul>
  </Layout>
)

export default IndexPage
