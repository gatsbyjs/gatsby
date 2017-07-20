import React from "react"
import Container from "../../components/container"
import BlogPostPreviewItem from "../../components/blog-post-preview-item"

class BlogPostsIndex extends React.Component {
  render() {
    const { allMarkdownRemark } = this.props.data

    return (
      <Container>
        <h1 css={{ marginTop: 0 }}>Blog</h1>
        {allMarkdownRemark.edges.map(({ node }) =>
          <BlogPostPreviewItem post={node} key={node.fields.slug} />
        )}
      </Container>
    )
  }
}

export default BlogPostsIndex

export const pageQuery = graphql`
  query BlogPostsIndexQuery {
    allMarkdownRemark(
      sort: { order: DESC, fields: [frontmatter___date] }
      filter: {
        frontmatter: { draft: { ne: true } }
        fileAbsolutePath: { regex: "/blog/" }
      }
    ) {
      edges {
        node {
          ...BlogPostPreview_item
        }
      }
    }
  }
`
