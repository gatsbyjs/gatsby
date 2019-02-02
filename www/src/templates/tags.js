import React from "react"
import { Link, graphql } from "gatsby"

import BlogPostPreviewItem from "../components/blog-post-preview-item"
import Container from "../components/container"
import Layout from "../components/layout"
import { rhythm } from "../utils/typography"

const Tags = ({ pageContext, data, location }) => {
  const { tag } = pageContext
  const { edges, totalCount } = data.allMarkdownRemark
  const tagHeader = `${totalCount} post${
    totalCount === 1 ? `` : `s`
  } tagged with "${tag}"`

  return (
    <Layout location={location}>
      <Container>
        <h1>{tagHeader}</h1>
        {edges.map(({ node }) => (
          <BlogPostPreviewItem
            post={node}
            key={node.fields.slug}
            css={{ marginBottom: rhythm(2) }}
          />
        ))}
        <Link to="/blog/tags">All tags</Link>
      </Container>
    </Layout>
  )
}

export default Tags

export const pageQuery = graphql`
  query($tag: String) {
    allMarkdownRemark(
      limit: 2000
      sort: { fields: [frontmatter___date, fields___slug], order: DESC }
      filter: {
        frontmatter: { tags: { in: [$tag] } }
        fileAbsolutePath: { regex: "/docs.blog/" }
        fields: { released: { eq: true } }
      }
    ) {
      totalCount
      edges {
        node {
          ...BlogPostPreview_item
        }
      }
    }
  }
`
