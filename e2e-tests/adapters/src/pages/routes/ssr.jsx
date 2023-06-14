import * as React from "react"
import Layout from "../../components/layout";

const SSR = ({ serverData, params }) => {
  return (
    <Layout>
      <h1>SSR</h1>
      <div>
        <code>
          <pre>
            {JSON.stringify({ params, serverData }, null, 2)}
          </pre>
        </code>
      </div>
    </Layout>
  )
}

export default SSR

export const Head = () => <title>SSR</title>

export function getServerData({ params }) {
  return {
    props: {
      ssr: true,
      params,
    },
  };
}