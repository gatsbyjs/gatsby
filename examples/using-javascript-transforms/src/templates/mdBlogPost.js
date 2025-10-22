import React from "react"
import { graphql } from "gatsby"
import BlogPostChrome from "../components/BlogPostChrome"

function mdBlogPost({data}) {
  const { html } = data.markdownRemark

return (
<BlogPostChrome
{...{
frontmatter: data.markdownRemark.frontmatter,
site: data.site,
}}
>
<div className="container content">
<div dangerouslySetInnerHTML={{ __html: html }} />
</div>
</BlogPostChrome>
);
}

export default mdBlogPost

export const pageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      ...MarkdownBlogPost_frontmatter
    }
    site {
      ...site_sitemetadata
    }
  }
`
