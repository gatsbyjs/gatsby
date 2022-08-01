import * as React from "react"

import Layout from "../components/layout"
import Seo from "../components/seo"

const UseEnv = ({ heading, envVar }) => (
  <React.Fragment>
    <h2>{heading}</h2>
    <pre>
      <code data-testid={heading}>{JSON.stringify(envVar)}</code>
    </pre>
  </React.Fragment>
)

const SecondPage = () => (
  <Layout>
    <h1>Using env vars</h1>
    <UseEnv heading="process.env" envVar={process.env} />
    <UseEnv
      heading="process.env.EXISTING_VAR"
      envVar={process.env.EXISTING_VAR}
    />
    <UseEnv
      heading="process.env.NOT_EXISTING_VAR"
      envVar={process.env.NOT_EXISTING_VAR}
    />
  </Layout>
)

export const Head = () => <Seo />

export default SecondPage
