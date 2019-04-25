import React from "react"
import { Link, graphql } from "gatsby"

import PostList from "../components/post-list"

const TagPageLayout = props => (
  <>
    <PostList {...props} />
    <Link to="/tags">See all Tags</Link>
  </>
)

export default TagPageLayout

export const pageQuery = graphql`
  query TagPage($tag: String) {
    allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { tags: { in: [$tag] }, draft: { ne: true } } }
    ) {
      edges {
        node {
          parent {
            ... on File {
              name
              sourceInstanceName
            }
          }
          frontmatter {
            title
            path
            date(formatString: "MMMM DD, YYYY")
          }
        }
      }
    }
  }
`
