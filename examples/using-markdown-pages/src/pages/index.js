import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"

const IndexPage = () => (
  <Layout>
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby blog with Markdown pages.</p>
    <p>
      <Link to="/blog/my-first-post/">Go to my first Markdown blog post</Link>
      <br />
      <Link to="/blog/my-second-post/">Go to my second Markdown blog post</Link>
    </p>
  </Layout>
)

export default IndexPage
