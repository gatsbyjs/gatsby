import React from "react"
import { graphql } from "gatsby"
import { MDXProvider } from "@mdx-js/react"
import { components } from "../components/shortcodes"

const PostsTemplate = ({ data, children }) => {
  return (
    <>
      <h1>{data.mdx.frontmatter.title}</h1>
      <pre>
        <code>{JSON.stringify(data.mdx.headings, null, 2)}</code>
      </pre>
      <MDXProvider components={components}>{children}</MDXProvider>
    </>
  )
}

export default PostsTemplate

export const Head = ({ data }) => <title>{data.mdx.frontmatter.title}</title>

export const query = graphql`
  query ($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
      }
      headings {
        depth
        value
      }
    }
  }
`
