import React from "react"
import { Link } from "gatsby"

import Layout from "../../../../components/layout"

export default function FakeDataStatic({ pageContext: { uuid } }) {
  return (
    <Layout>
      <h1 data-testid="custom-text">Static Template</h1>
      <p data-testid="pagecontext">{uuid}</p>
      <Link to="/">Back to home</Link>
    </Layout>
  )
}
