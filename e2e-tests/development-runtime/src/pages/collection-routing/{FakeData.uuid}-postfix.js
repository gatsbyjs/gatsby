import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../../components/layout"

export default function FakeDataPostfix({ data: { fake }, pageContext: { uuid } }) {
  return (
    <Layout>
      <h1>{fake.title}</h1>
      <h2 data-testid="slug">{fake.fields.slug}</h2>
      <p data-testid="pagecontext">{uuid}</p>
      <Link to="/">Back to home</Link>
    </Layout>
  )
}

export const blogPostQuery = graphql`
  query FakeDataPostfix($id: String!) {
    fake: fakeData(id: { eq: $id }) {
      fields {
        slug
      }
      title
      updates
      uuid
      message
    }
  }
`
