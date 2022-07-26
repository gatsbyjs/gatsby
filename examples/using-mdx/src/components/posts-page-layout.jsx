import React from "react"
import { graphql } from "gatsby"
import { MDXProvider } from "@mdx-js/react"
import { components } from "./shortcodes"

export default function PageTemplate({ data, children }) {
  return (
    <>
      <h1>{data.mdx.frontmatter.title}</h1>
      <MDXProvider components={components}>
        {children}
      </MDXProvider>
    </>
  )
}

export const query = graphql`
  query($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
      }
    }
  }
`