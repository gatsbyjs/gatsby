import React from "react"
import BlogPost from "../templates/blog-post"
import { graphql, createPagesFromData } from "gatsby"

export default createPagesFromData(
  BlogPost,
  graphql`
    {
      site {
        siteMetadata {
          title
        }
      }
      allMarkdownRemark(
        sort: { fields: [frontmatter___date], order: DESC }
        limit: 1000
      ) {
        nodes {
          id
          excerpt(pruneLength: 160)
          html
          frontmatter {
            title
            date(formatString: "MMMM DD, YYYY")
            description
          }

          fields {
            slug
          }
        }
      }
    }
  `
)
