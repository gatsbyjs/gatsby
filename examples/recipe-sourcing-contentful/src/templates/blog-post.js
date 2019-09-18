import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

const BlogPostTemplate = ({ pageContext }) => {
  return (
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
}

export default BlogPostTemplate
