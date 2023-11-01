import * as React from "react"
import Layout from "../../../components/layout"

const SSR = ({ serverData }) => {
  return (
    <Layout>
      <h1>SSR</h1>
      <div>
        <code>
          <pre>{JSON.stringify({ serverData }, null, 2)}</pre>
        </code>
      </div>
      <div>
        <code>
          <pre data-testid="query">
            {JSON.stringify(serverData?.arg?.query)}
          </pre>
          <pre data-testid="params">
            {JSON.stringify(serverData?.arg?.params)}
          </pre>
        </code>
      </div>
    </Layout>
  )
}

export default SSR

export const Head = () => <title>SSR</title>

export function getServerData(arg) {
  return {
    props: {
      ssr: true,
      arg,
    },
    headers: {
      "x-ssr-header-getserverdata": "my custom header value from getServerData",
      "x-ssr-header-overwrite": "getServerData wins",
    },
  }
}
