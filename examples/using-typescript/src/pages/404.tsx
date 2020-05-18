import { PageProps } from "gatsby"
import * as React from "react"
import Layout from "../components/layout"

const Error404Page: React.FC<PageProps> = () => (
  <Layout>
    <h1>You are here!</h1>
    <h2>But nothing found for you #404</h2>
  </Layout>
)

export default Error404Page
