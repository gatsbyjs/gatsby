import React from "react"
import HelmetBlock from "../HelmetBlock"
import PostPublished from "../PostPublished"

class BlogPostChrome extends React.Component {
  render() {
    const frontmatter = this.props

    return (
      <div className="BlogPostChrome">
        <HelmetBlock {...frontmatter} />
        <div className="content">
          <div className="section">
            <div className="container content">{this.props.children}</div>
          </div>
        </div>
        <PostPublished {...frontmatter} />
      </div>
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

  fragment JSBlogPost_data on JSFrontmatter {
    data {
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
