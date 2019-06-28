import React from "react"
import { MDXRenderer } from "gatsby-plugin-mdx"

import Layout from "./layout"

const WikiPage = ({
  data: {
    note: { body },
  },
  ...props
}) => (
  <Layout {...props}>
    <MDXRenderer>{body}</MDXRenderer>
  </Layout>
)

export default WikiPage
