import * as React from "react"
import { Link } from "gatsby"

import Seo from "../components/seo"

import Layout from "../components/layout"

const InternalServerErrorPage = () => (
  <Layout>
    <h1 data-testid="500">INTERNAL SERVER ERROR</h1>
    <p>Page could not be displayed</p>
    <pre data-testid="dom-marker">500</pre>
    <Link to="/" data-testid="index">
      Go to Index
    </Link>
  </Layout>
)

export const Head = () => <Seo />

export default InternalServerErrorPage
