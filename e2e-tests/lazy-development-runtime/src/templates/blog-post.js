import React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

function BlogPost({ data: { post } }) {
  return (
    <Layout>
      <SEO title={post.frontmatter.title} description={post.excerpt} />
      <h1>{post.frontmatter.title}</h1>
      <h2 data-testid="message">Hello %MESSAGE%</h2>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <Link to="/">Back to home</Link>
    </Layout>
  )
}

export default BlogPost

export const blogPostQuery = graphql`
  query GetBlogPostBySlug($slug: String!) {
    post: markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      excerpt(pruneLength: 160)
      frontmatter {
        title
      }
    }
  }
`
