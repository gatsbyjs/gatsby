import React from 'react'
import { graphql } from 'gatsby'
import Layout from '../components/layout'

export default ({ data }) => (
  <Layout>
    <div>
      <h1>{data.article.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: data.article.fields.html }} />
    </div>
  </Layout>
)

export const query = graphql`
  query($slug: String!) {
    article(slug: { eq: $slug }) {
      title
      fields {
        html
      }
    }
  }
`
