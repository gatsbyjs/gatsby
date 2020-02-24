import * as React from 'react'

import Layout from '../components/layout'
import InstrumentPage from '../utils/instrument-page'

const PathContextPage = ({ pathContext }) => (
  <Layout>
    <h1>Hello from a page that uses the old pathContext</h1>
    <p>It was deprecated in favor of pageContext, but is still supported</p>
    <p>
      page.pathContext.foo =
      <span data-testid="path-context-foo">{pathContext.foo}</span>
    </p>
  </Layout>
)

export default InstrumentPage(PathContextPage)
