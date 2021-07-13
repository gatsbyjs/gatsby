import * as React from "react"

import Layout from "../components/layout"
import { heading } from "../components/mystyle.module.css"

const CssModule = () => (
  <Layout>
    <h1 className={heading} data-testid="cssmodule">
      Hi, we're using cssmodules
    </h1>
  </Layout>
)

export default CssModule
