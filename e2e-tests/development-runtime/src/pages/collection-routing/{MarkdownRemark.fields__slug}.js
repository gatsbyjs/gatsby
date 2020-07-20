import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../components/layout"
import SEO from "../../components/seo"

export default function BlogPost({ data: { post } }) {
  return (
    <Layout>
      <SEO title={post.frontmatter.title} description={post.excerpt} />
      <h1>{post.frontmatter.title}</h1>
      <h2 data-testid="slug">{post.fields.slug}</h2>
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <Link to="/">Back to home</Link>
    </Layout>
  )
}

export const blogPostQuery = graphql`
  query GetBlogPostBySlugCollection($id: String!) {
    post: markdownRemark(id: { eq: $id }) {
      fields {
        slug
      }
      html
      excerpt(pruneLength: 160)
      frontmatter {
        title
      }
    }
  }
`
