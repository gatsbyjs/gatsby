import React from 'react'
import { Link, navigate } from 'gatsby'

import Layout from '../components/layout'

const IndexPage = () => (
  <Layout>
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <Link data-testid="page-2-link" to="/page-2/">
      Go to page 2
    </Link>
    <Link data-testid="page-blogtest-link" to="/blogtest/">
      Go to blogtest
    </Link>
    <button
      data-testid="page-2-button-link"
      onClick={() => navigate(`/page-2/`)}
    >
      Go to page 2 with navigate()
    </button>
    <Link data-testid="404-link" to="/not-existing-page">
      Go to not existing page
    </Link>
  </Layout>
)

export default IndexPage
