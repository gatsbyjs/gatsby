import React from "react"
import moment from "moment"
import BlogPostChrome from "../components/BlogPostChrome"

class mdBlogPost extends React.Component {
  render() {
    const { html, frontmatter } = this.props.data.markdownRemark

    return (
      <BlogPostChrome {...frontmatter}>
        <div className="container content">
          <div dangerouslySetInnerHTML={{ __html: html }} />
        </div>
      </BlogPostChrome>
    )
  }
}

export default mdBlogPost

export const pageQuery = graphql`
  query mdBlogPostBySlug($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      ...MarkdownBlogPost_frontmatter
    }
  }
`
