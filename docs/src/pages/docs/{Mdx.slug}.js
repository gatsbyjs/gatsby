import * as React from 'react'
import { graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'

export default function Doc (props) {
  return (
    <>
      <MDXRenderer children={props.data.mdx.body} />
    </>
  )
}

export const query = graphql`
  query($id: String!) {
    mdx(id: { eq: $id }) {
      slug
      body
      fields {
        section
      }
    }
  }
`
