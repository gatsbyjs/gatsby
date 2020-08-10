import React from "react"
import { Link, graphql, unstable_collectionGraphql } from "gatsby"
import Image from "gatsby-image"

import Layout from "../../components/layout"
import SEO from "../../components/seo"

export default function BlogPost({ data: { image } }) {
  return (
    <Layout>
      <SEO title={image.parent.name} />
      <h2 data-testid="name">{image.parent.name}</h2>
      <Image fixed={image.fixed} />
      <Link to="/">Back to home</Link>
    </Layout>
  )
}

export const blogPostQuery = graphql`
  query BlogPostBySlugCollection($id: String!) {
    image: imageSharp(id: { eq: $id }) {
      fixed(width: 125, height: 125) {
        ...GatsbyImageSharpFixed
      }
      parent {
        ... on File {
          name
        }
      }
    }
  }
`

// This should filter it down to just a single instance
export const collectionQuery = unstable_collectionGraphql`
  {
    allImageSharp(limit: 1, skip: 1) {
      ...CollectionPagesQueryFragment
    }
  }
`
