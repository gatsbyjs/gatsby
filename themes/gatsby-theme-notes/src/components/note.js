import React from "react"
import MDXRenderer from "gatsby-mdx/mdx-renderer"

import Layout from "./layout"

const WikiPage = ({
  data: {
    note: {
      code: { body },
    },
  },
}) => (
  <Layout>
    <MDXRenderer>{body}</MDXRenderer>
  </Layout>
)

export default WikiPage
