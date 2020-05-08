import { graphql } from "gatsby"
import Post from "../components/post"
import React from "react"

export default ({ location, data }) => {
  const { blogPost, previous, next } = data

  return (
    <Post
      data={{ ...data, post: blogPost }}
      location={location}
      previous={previous}
      next={next}
    />
  )
}

export const query = graphql`
  query PostPageQuery($id: String!, $previousId: String, $nextId: String) {
    site {
      siteMetadata {
        title
        social {
          name
          url
        }
      }
    }
    blogPost(id: { eq: $id }) {
      id
      excerpt
      body
      slug
      title
      tags
      date(formatString: "MMMM DD, YYYY")
      image {
        childImageSharp {
          fluid {
            ...GatsbyImageSharpFluid
          }
        }
      }
    }
    previous: blogPost(id: { eq: $previousId }) {
      id
      excerpt
      slug
      title
      date(formatString: "MMMM DD, YYYY")
    }
    next: blogPost(id: { eq: $nextId }) {
      id
      excerpt
      slug
      title
      date(formatString: "MMMM DD, YYYY")
    }
  }
`
