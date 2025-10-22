import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/Layout"
import { rhythm } from "../utils/typography"

function BlogIndex({location, data}) {
  const siteTitle = data.site.siteMetadata.title
const description = data.site.siteMetadata.description
const posts = data.allMarkdownRemark.edges

return (
<Layout
location={location}
title={siteTitle}
desc={description}
>
{posts.map(({ node }) => {
const title = node.frontmatter.title || node.fields.slug
return (
<div key={node.fields.slug}>
<h3
style={{
marginBottom: rhythm(1 / 4),
}}
>
<Link style={{ boxShadow: `none` }} to={node.fields.slug}>
{title}
</Link>
</h3>
<small>{node.frontmatter.date}</small>
<p dangerouslySetInnerHTML={{ __html: node.excerpt }} />
</div>
)
})}
</Layout>
);
}

export default BlogIndex

export const pageQuery = graphql`
  {
    site {
      siteMetadata {
        title
        description
      }
    }
    allMarkdownRemark(
      sort: { frontmatter: { date: DESC } }
      filter: { frontmatter: { title: { ne: "" } } }
    ) {
      edges {
        node {
          excerpt
          fields {
            slug
          }
          frontmatter {
            date(formatString: "MMMM DD, YYYY")
            title
          }
        }
      }
    }
  }
`
