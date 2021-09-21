import * as React from 'react'
import { graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
// import Provider from '../../components/provider'

export default function Doc (props) {
  return (
    <MDXRenderer children={props.data.mdx.body} />
  )
}

export const query = graphql`
  query($id: String!) {
    mdx: mdxDoc(id: { eq: $id }) {
      slug
      body
    }
  }
`
