import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../layouts"

class TagRoute extends React.Component {
  render() {
    const posts = this.props.data.allMarkdownRemark.edges
    const postLinks = posts.map(post => (
      <li key={post.node.fields.slug}>
        <Link to={post.node.fields.slug}>{post.node.frontmatter.title}</Link>
      </li>
    ))

    return (
      <Layout location={this.props.location}>
        <h1>
          {this.props.data.allMarkdownRemark.totalCount}
          {` `}
          posts tagged with “{this.props.pageContext.tag}”
        </h1>
        <ul>{postLinks}</ul>
        <p>
          <Link to="/tags/">Browse all tags</Link>
        </p>
      </Layout>
    )
  }
}

export default TagRoute

export const pageQuery = graphql`
  query ($tag: String) {
    allMarkdownRemark(
      limit: 1000
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { tags: { in: [$tag] }, draft: { ne: true } } }
    ) {
      totalCount
      edges {
        node {
          fields {
            slug
          }
          frontmatter {
            title
          }
        }
      }
    }
  }
`
