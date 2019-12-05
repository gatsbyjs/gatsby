import React from "react"
import { graphql } from "gatsby"
import BlogPost from "../../components/template-parts/blog-post"

export default ({ data }) => <BlogPost data={data} />

export const query = graphql`
  query alot($id: String!, $nextPage: String, $previousPage: String) {
    page: wpAlot(id: { eq: $id }) {
      title
      content
      featuredImage {
        remoteFile {
          ...HeroImage
        }
      }
    }

    nextPage: wpAlot(id: { eq: $nextPage }) {
      title
      link
    }

    previousPage: wpAlot(id: { eq: $previousPage }) {
      title
      link
    }
  }
`
