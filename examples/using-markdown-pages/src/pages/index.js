import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"

const IndexPage = () => (
  <Layout>
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby blog with Markdown pages.</p>
    <Link to="/blog/my-first-post/">Go to my first Markdown blog post</Link>
  </Layout>
)

export default IndexPage
