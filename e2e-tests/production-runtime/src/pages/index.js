import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import InstrumentPage from '../utils/instrument-page'

const IndexPage = ({ pageContext }) => (
  <Layout>
    <h1>Hi people</h1>
    <pre data-testid="dom-marker">{pageContext.DOMMarker || `index`}</pre>
    <ul>
      <li>
        <Link to="/page-2/">
          <span data-testid="page2">Go to page 2</span>
        </Link>
      </li>
      <li>
        <Link to="/page-3/" data-testid="404">
          To non-existent page
        </Link>
      </li>
      <li>
        <Link to="/long-page/" data-testid="long-page">
          To long page
        </Link>
      </li>
      <li>
        <Link to="/duplicated/" data-testid="duplicated">
          Another page using Index template
        </Link>
      </li>
      <li>
        <Link to="/client-only-paths/" data-testid="client-only-paths">
          Client only paths
        </Link>
      </li>
    </ul>
  </Layout>
)

export default InstrumentPage(IndexPage)
