import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const SecondPage = () => (
  <Layout>
    <SEO title="Payment Success" />
    <h1>Success!</h1>
    <Link to="/">Shop again</Link>
  </Layout>
)

export default SecondPage
