import React from "react"
import { Link, graphql } from "gatsby"
import Image from "gatsby-image"

import Layout from "../../components/layout"
import Seo from "../../components/seo"

export default function BlogPost({
  data: { image },
  pageContext: { parent__name },
}) {
  return (
    <Layout>
      <h2 data-testid="name">{image.parent.name}</h2>
      <p data-testid="pagecontext">{parent__name}</p>
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

export const Head = ({ data: { image } }) => {
  return <Seo title={image.parent.name} />
}
