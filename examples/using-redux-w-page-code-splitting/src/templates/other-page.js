import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

const OtherPage = ({ data }) => {
  const post = data.pagesJson
  return (
    <Layout>
      <div>{post.title}</div>
    </Layout>
  )
}

export const query = graphql`
  query($slug: String!) {
    pagesJson(slug: { eq: $slug }) {
      title
      slug
    }
  }
`

export default OtherPage
