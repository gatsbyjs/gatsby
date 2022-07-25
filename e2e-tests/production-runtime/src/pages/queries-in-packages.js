import * as React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"

export default () => <Layout></Layout>

export const Head = () => (
  <Seo
    title="Testing queries in packages"
    keywords={[`gatsby`, `application`, `react`, `queries in component`]}
  />
)
