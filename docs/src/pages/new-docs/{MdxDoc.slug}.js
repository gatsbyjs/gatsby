import * as React from 'react'
import { graphql } from 'gatsby'
import { MDXRenderer } from 'gatsby-plugin-mdx'
import Layout from '../../components/layout'
// import Provider from '../../components/provider'

export default function Doc (props) {
  return (
    <Layout>
      <MDXRenderer children={props.data.mdx.body} />
    </Layout>
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
