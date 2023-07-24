import * as React from "react"
import { graphql } from "gatsby"
import Layout from "../../../components/layout"

const DSGWithGraphQLQuery = ({ data: { site: { siteMetadata } } }) => {
  return (
    <Layout>
      <h1>DSG</h1>
      <p data-testid="title">{siteMetadata.title}</p>
    </Layout>
  )
}

export default DSGWithGraphQLQuery

export const Head = () => <title>DSG</title>

export async function config() {
  return () => {
    return {
      defer: true,
    }
  }
}

export const query = graphql`
  {
    site {
      siteMetadata {
        title
      }
    }
  }
`