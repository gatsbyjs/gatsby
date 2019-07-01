import React from "react"
import { MDXRenderer } from "gatsby-plugin-mdx"

import Layout from "./layout"

const WikiPage = ({
  data: {
    note: { body },
    site: {
      siteMetadata: { title },
    },
  },
  ...props
}) => (
  <Layout {...props} title={title}>
    <MDXRenderer>{body}</MDXRenderer>
  </Layout>
)

export default WikiPage
