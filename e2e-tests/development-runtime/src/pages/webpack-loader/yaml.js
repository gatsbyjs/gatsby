import * as React from "react"
import Layout from "../../components/layout"

import inputYaml from "../../test-files/input.yaml"

const YamlPage = () => (
  <Layout>
    <pre>
      <code data-testid="webpack-loader-yaml">
        {JSON.stringify(inputYaml, null, 0)}
      </code>
    </pre>
  </Layout>
)

export default YamlPage