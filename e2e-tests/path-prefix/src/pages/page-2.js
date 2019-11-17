import React from 'react'
import { Link, navigate } from 'gatsby'

import Layout from '../components/layout'

const SecondPage = () => (
  <Layout>
    <h1>Hi from the second page</h1>
    <p>Welcome to page 2</p>
    <Link data-testid="index-link" to="/">
      Go back to the homepage
    </Link>
    <button data-testid="back-button-page-2" onClick={() => navigate(-1)}>
      back
    </button>
  </Layout>
)

export default SecondPage
