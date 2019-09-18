import React from "react"
import Layout from "../components/layout"

const BlogPostTemplate = ({ pageContext }) => (
  <Layout>
    <h1>{pageContext.title}</h1>
    <div
      dangerouslySetInnerHTML={{
        __html:
          pageContext.childContentfulBlogPostBodyTextNode.childMarkdownRemark
            .html,
      }}
    />
  </Layout>
)

export default BlogPostTemplate
