import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"

const IndexPage = () => (
  <Layout>
    <h1>Gatsby Image integration test</h1>
    <h2>
      Please navigate to <Link to="/fixed">/fixed</Link>,{` `}
      <Link to="/fluid">/fluid</Link>, or <Link to="/traced">/traced</Link>.
    </h2>
  </Layout>
)

export default IndexPage
