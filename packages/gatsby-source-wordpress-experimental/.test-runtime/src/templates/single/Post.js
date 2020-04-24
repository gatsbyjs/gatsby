import React from "react"
import { graphql } from "gatsby"
import BlogPost from "../../components/template-parts/blog-post"

export default ({ data }) => <BlogPost data={data} />

export const query = graphql`
  query post($id: String!, $nextPage: String, $previousPage: String) {
    page: wpPost(id: { eq: $id }) {
      title
      content
      featuredImage {
        remoteFile {
          ...HeroImage
        }
      }
    }

    nextPage: wpPost(id: { eq: $nextPage }) {
      title
      link
    }

    previousPage: wpPost(id: { eq: $previousPage }) {
      title
      link
    }
  }
`
