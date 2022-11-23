import React from "react"
import { graphql, Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const GatsbyPreview = ({ data }) => (
  <Layout>
    <h1>Gatsby Preview e2e test</h1>
    <ul id="fake-data">
      {data.allFakeData.nodes.map(node => (
        <li key={node.id}>
          <Link to={node.fields.slug}>{node.title}</Link>
        </li>
      ))}
    </ul>
    <ul id="pinc-data">
      {data.allPincData.nodes.map(node => (
        <li key={node.id}>
          <Link to={node.fields.slug}>{node.title}</Link>
        </li>
      ))}
    </ul>
  </Layout>
)

export default GatsbyPreview

export const Head = () => <Seo title="Gatsby Preview e2e Test" />

export const previewQuery = graphql`
  query {
    allPincData {
      nodes {
        id
        title
        fields {
          slug
        }
      }
    }
    allFakeData {
      nodes {
        id
        title
        fields {
          slug
        }
      }
    }
  }
`
