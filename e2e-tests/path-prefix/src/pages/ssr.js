import * as React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"

const SSRPage = ({ serverData }) => (
  <Layout>
    <h1>Hi from the SSR page</h1>
    <p>Welcome to SSR page</p>
    <Link data-testid="index-link" to="/">
      Go back to the homepage
    </Link>
    <code data-testid="server-data">{serverData?.dataFromServer}</code>
  </Layout>
)

export default SSRPage

export function getServerData() {
  return {
    props: {
      dataFromServer: `foo`,
    },
  }
}
