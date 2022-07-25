import React from "react"
import { Link, navigate } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"
import InstrumentPage from "../utils/instrument-page"

const SecondPage = () => (
  <Layout>
    <h1 data-testid="page-2-message">Hi from the second page</h1>
    <p>Welcome to page 2</p>
    <Link to="/" data-testid="back-button">
      Go back to the homepage
    </Link>
    <button data-testid="back-by-number" onClick={() => navigate(-1)}>
      Navigate by number back
    </button>
  </Layout>
)

export const Head = () => <Seo title="Page two" />

export default InstrumentPage(SecondPage)
