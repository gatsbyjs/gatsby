import React from 'react'

import Layout from '../components/layout'
import InstrumentPage from '../utils/instrument-page'

const DeepLinkPage = () => (
  <Layout>
    <h1>
      Hi from a deeply linked page (need to click twice to get here from index).
      Used to navigate to a non prefetched page by
      integrations/compilation-hash.js tests
    </h1>
  </Layout>
)

export default InstrumentPage(DeepLinkPage)
