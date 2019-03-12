import React from "react"
import { graphql } from "gatsby"
import TagsIcon from "react-icons/lib/ti/tags"

import BlogPostPreviewItem from "../components/blog-post-preview-item"
import Button from "../components/button"
import Container from "../components/container"
import Layout from "../components/layout"
import { space } from "../utils/presets"
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
        <Button tiny key="blog-post-view-all-tags-button" to="/blog/tags">
          View All Tags <TagsIcon />
        </Button>
        {edges.map(({ node }) => (
          <BlogPostPreviewItem
            post={node}
            key={node.fields.slug}
            css={{
              marginTop: rhythm(space[9]),
              marginBottom: rhythm(space[9]),
            }}
          />
        ))}
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
