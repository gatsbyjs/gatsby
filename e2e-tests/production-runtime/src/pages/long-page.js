import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const LongPage = () => (
  <Layout>
    <h1>Hi from the long page</h1>
    <p>Welcome to long page</p>
    <div style={{ height: `200vh` }} />
    <Link to="/" data-testid="below-the-fold">
      Go back to the homepage - middle of the page
    </Link>
    <div style={{ height: `200vh` }} />
    <h1 id="áccentuated">Special Hash ID</h1>
    <div style={{ height: `200vh` }} />
    <Link to="/" data-testid="even-more-below-the-fold">
      Go back to the homepage - bottom of the page
    </Link>
  </Layout>
)

export const Head = () => <Seo />

export default LongPage
