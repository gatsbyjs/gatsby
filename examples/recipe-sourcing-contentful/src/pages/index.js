import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"

const IndexPage = ({ data }) => (
  <Layout>
    <h1>Contentful data source example</h1>
    <ul>
      {data.allContentfulNews.edges.map(({ node }, index) => (
        <li key={index}>
          <h2>{node.title}</h2>
          <p>
            <strong>{node.createdAt}</strong>
            {` — `}
            {node.body.body}
          </p>
        </li>
      ))}
    </ul>
  </Layout>
)

export default IndexPage

export const query = graphql`
  {
    allContentfulNews(sort: { fields: [updatedAt] }) {
      edges {
        node {
          title
          body {
            body
          }
          createdAt(formatString: "MMMM DD YYYY")
        }
      }
    }
  }
`
