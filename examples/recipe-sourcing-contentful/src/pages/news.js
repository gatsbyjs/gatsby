import React from "react"
import { graphql } from "gatsby"
import Layout from "../components/layout"
import SEO from "../components/seo"

const NewsPage = ({ data }) => (
  <Layout>
    <SEO title="News" />
    <h1>News</h1>
    {data.allContentfulNews.edges.map(({ node }) => (
      <>
        <h2>{node.title}</h2>
        <p>
          <strong>{node.createdAt}</strong>
          {` — `}
          {node.body.body}
        </p>
      </>
    ))}
  </Layout>
)

export default NewsPage

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
