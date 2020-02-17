import React from "react"
import { graphql } from "gatsby"
import {MDXRenderer} from "gatsby-plugin-mdx"

export default function Template({
  data, // this prop will be injected by the GraphQL query below.
}) {
  const { mdx} = data // data.markdownRemark holds our post data
  const { frontmatter } = mdx
  return (
    <div className="blog-post-container">
      <div className="blog-post">
        <h1>{frontmatter.title}</h1>
        <h2>{frontmatter.date}</h2>

        <MDXRenderer className="blog-post-content">{mdx.body}</MDXRenderer>

      </div>
    </div>
  )
}


export const pageQuery = graphql`
  query($path: String!) {
    mdx(frontmatter: { path: { eq: $path } }) {
      body
      frontmatter {
        date(formatString: "MMMM DD, YYYY")
        path
        title
      }
    }
  }
`
