import * as React from "react"

import Layout from "../components/layout"
import InstrumentPage from "../utils/instrument-page"

const DeepLinkPage = () => (
  <Layout>
    <h1>Hi from a deeply linked page</h1>
    <p>
      Used to navigate to a non prefetched page by
      integrations/compilation-hash.js tests
    </p>
  </Layout>
)

export default InstrumentPage(DeepLinkPage)
