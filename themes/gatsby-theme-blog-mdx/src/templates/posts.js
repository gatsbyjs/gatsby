import React from "react"
import { graphql } from "gatsby"

import Layout from "../components/layout"
import PostList from "../components/post-list"
import Pagination from "../components/pagination"

const Posts = ({ pathContext, ...props }) => (
  <Layout>
    <PostList {...props} />
    <Pagination {...pathContext} />
  </Layout>
)

export default Posts

export const pageQuery = graphql`
  query {
    allMdx(
      sort: { fields: [frontmatter___date], order: DESC }
      filter: { frontmatter: { draft: { ne: true }, archived: { ne: true } } }
    ) {
      edges {
        node {
          id
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
