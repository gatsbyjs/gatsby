import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="Home" />
    <h1>Hi people</h1>
    <h2>Welcome to the image processing benchmarking site</h2>
    {data.allRemoteImage.nodes.map(n => (
      <div key={n.id}>
        <Link to={`/${n.id}/`}>{n.id}</Link>
      </div>
    ))}
  </Layout>
)

export default IndexPage

export const query = graphql`
  query {
    allRemoteImage {
      totalCount
      nodes {
        id
      }
    }
  }
`
