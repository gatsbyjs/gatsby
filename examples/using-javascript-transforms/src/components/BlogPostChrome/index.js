import React from "react"
import HelmetBlock from "../HelmetBlock"
import PostPublished from "../PostPublished"
import BlogPostLayout from "../Layouts/blogPost"

class BlogPostChrome extends React.Component {
  render() {
    return (
      <BlogPostLayout {...this.props.site}>
        <div className="BlogPostChrome">
          <HelmetBlock {...this.props.frontmatter} />
          <div className="content">
            <div className="section">
              <div className="container content">{this.props.children}</div>
            </div>
          </div>
          <PostPublished {...this.props.frontmatter} />
        </div>
      </BlogPostLayout>
    )
  }
}

export default BlogPostChrome

export const blogPostFragment = graphql`
  fragment MarkdownBlogPost_frontmatter on MarkdownRemark {
    frontmatter {
      title
      path
      layoutType
      written
      updated
      category
      description
    }
  }

  fragment JSBlogPost_frontmatter on JavascriptFrontmatter {
    frontmatter {
      title
      path
      layoutType
      written
      updated
      category
      description
    }
  }
`
