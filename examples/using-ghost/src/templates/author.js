import React, { Component } from "react"
import { graphql, Link } from "gatsby"
import Layout from "../layouts"
import { rhythm } from "../utils/typography"

class AuthorTemplate extends Component {
  render() {
    const pageContext = this.props.pageContext
    const currentPosts = this.props.data.allGhostPost

    return (
      <Layout>
        <h1>{pageContext.name}</h1>
        {currentPosts
          ? currentPosts.edges.map(({ node }) => (
              <div css={{ marginBottom: rhythm(2) }} key={node.slug}>
                <Link to={node.slug} css={{ textDecoration: `none` }}>
                  <h3 css={{ color: `rgba(28,160,134,1)` }}>{node.title}</h3>
                </Link>
                <div>{node.custom_excerpt}</div>
              </div>
            ))
          : null}
      </Layout>
    )
  }
}

export default AuthorTemplate

export const pageQuery = graphql`
  query($slug: String!) {
    allGhostPost(
      limit: 5
      filter: { authors: { elemMatch: { slug: { eq: $slug } } } }
    ) {
      edges {
        node {
          slug
          title
          custom_excerpt
        }
      }
    }
  }
`
