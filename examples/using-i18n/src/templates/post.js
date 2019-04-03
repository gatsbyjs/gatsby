import React from "react"
import { graphql } from "gatsby"
import MDXRenderer from "gatsby-mdx/mdx-renderer"
import MdxLink from "../components/mdxLink"

const Post = ({ data: { mdx } }) => (
  <>
    <h1>{mdx.frontmatter.title}</h1>
    <MDXRenderer
      components={{
        a: MdxLink,
      }}
    >
      {mdx.code.body}
    </MDXRenderer>
  </>
)

export default Post

export const query = graphql`
  query Post($locale: String!, $title: String!) {
    mdx(
      frontmatter: { title: { eq: $title } }
      fields: { locale: { eq: $locale } }
    ) {
      frontmatter {
        title
      }
      code {
        body
      }
    }
  }
`
