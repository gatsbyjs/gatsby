import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import InstrumentPage from "../utils/instrument-page"
import Seo from "../components/seo"

const SecondPage = () => (
  <Layout>
    <h1 data-testid="page-2-message">Hi from the second page</h1>
    <p>Welcome to page 2</p>
    <pre data-testid="dom-marker">page-2</pre>
    <ul>
      <li>
        <Link to="/" data-testid="index">
          Go to Index
        </Link>
      </li>
      <li>
        <Link to="/page-3/" data-testid="404">
          To non-existent page
        </Link>
      </li>
    </ul>
  </Layout>
)

export const Head = () => <Seo />

export default InstrumentPage(SecondPage)
