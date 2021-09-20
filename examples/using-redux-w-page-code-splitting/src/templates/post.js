import * as React from "react"
import { graphql } from "gatsby"
import ReduxWrapper from "../redux/reduxWrapper"
import ReduxButton from "../components/redux-button"
import Layout from "../components/layout"

const BlogPost = ({ data }) => {
  const post = data.pagesJson
  return (
    <Layout>
      <div>{post.title}</div>
      <ReduxButton />
    </Layout>
  )
}

// Wrap the BlogPost in the Provider and pass the query results in props. This could be refactored to use `children`.
const WrappedPage = ({ data }) => (
  <ReduxWrapper element={<BlogPost data={data} />} />
)

export const query = graphql`
  query($slug: String!) {
    pagesJson(slug: { eq: $slug }) {
      title
      slug
    }
  }
`

export default WrappedPage
