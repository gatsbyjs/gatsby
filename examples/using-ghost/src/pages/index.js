import React, { Component } from "react"
import { Link, graphql } from "gatsby"
import Layout from "../layouts"
import { rhythm } from "../utils/typography"

class Home extends Component {
  render() {
    const data = this.props.data

    return (
      <Layout>
        <div css={{ marginBottom: rhythm(1) }}>
          <h1>Latest Posts</h1>
          {data
            ? data.allGhostPost.edges.map(({ node }) => (
                <div css={{ marginBottom: rhythm(2) }} key={node.slug}>
                  <Link to={node.slug} css={{ textDecoration: `none` }}>
                    <h3 css={{ color: `rgba(28,160,134,1)` }}>{node.title}</h3>
                  </Link>
                  <div>{node.custom_excerpt}</div>
                </div>
              ))
            : null}
        </div>
        <h1>Pages</h1>
        {data
          ? data.allGhostPage.edges.map(({ node }) => (
              <div key={node.slug}>
                <Link to={node.slug} css={{ textDecoration: `none` }}>
                  {node.title}
                </Link>
              </div>
            ))
          : null}
        <h1>Tags</h1>
        {data
          ? data.allGhostTag.edges.map(({ node }) => (
              <div key={node.slug}>
                <Link to={`tag/${node.slug}`} css={{ textDecoration: `none` }}>
                  {node.name}
                </Link>
              </div>
            ))
          : null}
        <h1>Author</h1>
        {data
          ? data.allGhostAuthor.edges.map(({ node }) => (
              <div key={node.slug}>
                <Link
                  to={`author/${node.slug}`}
                  css={{ textDecoration: `none` }}
                >
                  {node.name}
                </Link>
              </div>
            ))
          : null}
      </Layout>
    )
  }
}

export default Home

export const pageQuery = graphql`
  {
    allGhostPost(limit: 3) {
      edges {
        node {
          title
          html
          slug
          custom_excerpt
        }
      }
    }
    allGhostPage {
      edges {
        node {
          title
          html
          slug
        }
      }
    }
    allGhostTag(limit: 5) {
      edges {
        node {
          name
          slug
        }
      }
    }
    allGhostAuthor(limit: 5) {
      edges {
        node {
          name
          slug
        }
      }
    }
  }
`
