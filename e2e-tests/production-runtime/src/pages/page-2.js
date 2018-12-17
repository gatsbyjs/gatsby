import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import InstrumentPage from '../utils/instrument-page'

const SecondPage = () => (
  <Layout>
    <h1>Hi from the second page</h1>
    <p>Welcome to page 2</p>
    <pre data-testid="dom-marker">page-2</pre>
    <Link to="/">Go back to the homepage</Link>
  </Layout>
)

export default InstrumentPage(SecondPage)
