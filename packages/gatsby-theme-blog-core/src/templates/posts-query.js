import { graphql } from "gatsby"
import React from "react"

import Posts from "../components/posts"

export default ({ location, data }) => {
  const { site, allBlogPost } = data
  return (
    <Posts
      location={location}
      posts={allBlogPost.edges}
      siteTitle={site.siteMetadata.title}
      socialLinks={site.siteMetadata.social}
    />
  )
}

export const query = graphql`
  query PostsQuery {
    site {
      siteMetadata {
        title
        social {
          name
          url
        }
      }
    }
    allBlogPost(sort: { fields: [date, title], order: DESC }, limit: 1000) {
      edges {
        node {
          id
          excerpt
          slug
          title
          date(formatString: "MMMM DD, YYYY")
          tags
          image {
            childImageSharp {
              fluid {
                ...GatsbyImageSharpFluid
              }
            }
          }
        }
      }
    }
  }
`
