import * as React from "react"
import { Link, Slice } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const NotFoundPage = () => (
  <Layout>
    <h1 data-testid="404">NOT FOUND</h1>
    <p>You just hit a route that doesn&#39;t exist... the sadness.</p>
    <pre data-testid="dom-marker">404</pre>
    <Link to="/" data-testid="index">
      Go to Index
    </Link>
    <Slice alias="mappedslice" />
  </Layout>
)

export const Head = () => <Seo />

export default NotFoundPage
