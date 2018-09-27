import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'

const IndexPage = () => (
  <Layout>
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <Link to="/page-2/">
      <span data-testid="page2">Go to page 2</span>
    </Link>
    <Link to="/page-3/" data-testid="404">
      To non-existent page
    </Link>
    <Link to="/long-page/" data-testid="long-page">
      To long page
    </Link>
  </Layout>
)

export default IndexPage
