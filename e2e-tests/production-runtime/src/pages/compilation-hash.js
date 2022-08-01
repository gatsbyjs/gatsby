import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import InstrumentPage from "../utils/instrument-page"
import Seo from "../components/seo"

const CompilationHashPage = () => (
  <Layout>
    <h1>Hi from Compilation Hash page</h1>
    <p>Used by integration/compilation-hash.js test</p>
    <p>
      <Link to="/deep-link-page/" data-testid="deep-link-page">
        To deeply linked page
      </Link>
    </p>
  </Layout>
)

export const Head = () => <Seo />

export default InstrumentPage(CompilationHashPage)
