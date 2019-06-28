import React from "react"
import { graphql } from "gatsby"
import { Styled, css } from "theme-ui"

import PostFooter from "../components/post-footer"
import Layout from "../components/layout"
import SEO from "../components/seo"
import { MDXRenderer } from "gatsby-plugin-mdx"

class BlogPostTemplate extends React.Component {
  render() {
    const post = this.props.data.mdx
    const siteTitle = this.props.data.site.siteMetadata.title
    const { previous, next } = this.props.pageContext

    return (
      <Layout location={this.props.location} title={siteTitle}>
        <SEO title={post.frontmatter.title} description={post.excerpt} />
        <main>
          <Styled.h1>{post.frontmatter.title}</Styled.h1>
          <Styled.p
            css={css({
              fontSize: 1,
              mt: -3,
              mb: 3,
            })}
          >
            {post.frontmatter.date}
          </Styled.p>
          <MDXRenderer>{post.body}</MDXRenderer>
        </main>
        <PostFooter {...{ previous, next }} />
      </Layout>
    )
  }
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
        author
      }
    }
    mdx(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      body
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
      }
    }
  }
`
