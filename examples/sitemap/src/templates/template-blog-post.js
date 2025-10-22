import React from "react"
import { graphql } from "gatsby"

function BlogPost({data}) {
  const { html, frontmatter } = data.markdownRemark
return (
<div>
<h1>{frontmatter.title}</h1>
<div className="container content">
<div dangerouslySetInnerHTML={{ __html: html }} />
</div>
</div>
);
}

export default BlogPost

export const PageQuery = graphql`
  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
    site {
      siteMetadata {
        title
      }
    }
  }
`
