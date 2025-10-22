import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/Layout"
import { rhythm, scale } from "../utils/typography"

function BlogPostTemplate({data, pageContext, location}) {
  const post = data.markdownRemark
const siteTitle = data.site.siteMetadata.title
const { previous, next } = pageContext

return (
<Layout location={location} title={siteTitle}>
<h1>{post.frontmatter.title}</h1>
<p
style={{
...scale(-1 / 5),
display: `block`,
marginBottom: rhythm(1),
marginTop: rhythm(-1),
}}
>
{post.frontmatter.date}
</p>
<p
style={{
...scale(-1 / 5),
display: `block`,
marginBottom: rhythm(1),
marginTop: rhythm(1),
}}
>
Written by: <strong>{post.frontmatter.author.id}</strong> -{` `}
{post.frontmatter.author.bio}
</p>
<div dangerouslySetInnerHTML={{ __html: post.html }} />
<hr
style={{
marginBottom: rhythm(1),
}}
/>

<ul
style={{
display: `flex`,
flexWrap: `wrap`,
justifyContent: `space-between`,
listStyle: `none`,
padding: 0,
}}
>
<li>
{previous && (
<Link to={previous.fields.slug} rel="prev">
← {previous.frontmatter.title}
</Link>
)}
</li>
<li>
{next && (
<Link to={next.fields.slug} rel="next">
{next.frontmatter.title} →
</Link>
)}
</li>
</ul>
</Layout>
);
}

export default BlogPostTemplate

export const pageQuery = graphql`
  query BlogPostBySlug($slug: String!) {
    site {
      siteMetadata {
        title
      }
    }
    markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      excerpt(pruneLength: 160)
      html
      frontmatter {
        title
        date(formatString: "MMMM DD, YYYY")
        author {
          id
          bio
        }
      }
    }
  }
`
