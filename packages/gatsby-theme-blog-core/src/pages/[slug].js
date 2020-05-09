import PostTemplate from "../templates/post-query"
import { graphql, createPagesFromData } from "gatsby"

export default createPagesFromData(
  PostTemplate,
  graphql`
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
        nodes {
          id
          excerpt
          body
          slug
          title
          tags
          keywords
          date(formatString: "MMMM DD, YYYY")
        }
      }
    }
  `
)
