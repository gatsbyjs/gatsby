import React from "react"
import { createPagesFromData, Link, graphql } from "gatsby"

import Layout from "../../components/layout"
import SEO from "../../components/seo"

function BlogPost({ data: { product } }) {
  return (
    <Layout>
      <SEO title={product.name} description={product.name} />
      <h1>{product.id}</h1>
      <h2 data-testid="name">{product.name}</h2>
      <Link to="/">Back to home</Link>
    </Layout>
  )
}

export default createPagesFromData(BlogPost, `Product`)

export const blogPostQuery = graphql`
  query GetBlogPostBySlugCollection($name: String!) {
    product: product(fields: { name: { eq: $name } }) {
      id
      name
    }
  }
`
