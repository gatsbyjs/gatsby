import { graphql } from "gatsby"
import React from "react"
import HelmetBlock from "../HelmetBlock"
import PostPublished from "../PostPublished"
import BlogPostLayout from "../Layouts/blogPost"

function BlogPostChrome({site, frontmatter, children}) {
  return (
<BlogPostLayout {...site}>
<div className="BlogPostChrome">
<HelmetBlock {...frontmatter} />
<div className="content">
<div className="section">
<div className="container content">{children}</div>
</div>
</div>
<PostPublished {...frontmatter} />
</div>
</BlogPostLayout>
);
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
