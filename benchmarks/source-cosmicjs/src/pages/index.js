import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout_1"

const Index = ({ data }) => {
  return (
    <Layout>
      {data.site.siteMetadata.siteTitle}
      <ul>
        {data.articles.edges.map(article => (
          <li>
            <Link to={article.node.slug}>{article.node.title}</Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default Index

export const query = graphql`
  {
    site {
      siteMetadata {
        siteTitle
      }
    }
    articles: allCosmicjsPosts {
      edges {
        node {
          title
          slug
        }
      }
    }
  }
`
