import * as React from "react"
import { Link } from "gatsby"
import Layout from "../components/layout"
import Image from "../components/image"

const IndexPage = () => (
  <Layout>
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <div
      data-testid="gatsby-logo"
      style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}
    >
      <Image />
    </div>
    <Link to="/page-2">To page 2</Link>
  </Layout>
)

export default IndexPage

export const Head = () => <title>Gatsby Default Starter</title>
