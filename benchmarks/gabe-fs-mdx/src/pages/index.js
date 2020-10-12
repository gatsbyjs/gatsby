import React from "react"
import { Link, graphql } from "gatsby"
import Layout from "../components/layout_1"

const Index = ({ data }) => {
  return (
    <Layout>
      {data.site.siteMetadata.siteTitle}
      <ul>
        {data?.articles?.nodes.map((article) => (
          <li key={article.slug}>
            <Link to={'/' + article.slug}>{article.frontmatter.title}</Link>
          </li>
        ))}
      </ul>
    </Layout>
  )
}

export default Index

export const query = graphql`
  query {
    site {
      siteMetadata {
        siteTitle
      }
    }
    articles: allMdx(limit: 100) {
      nodes {
        frontmatter {
          title
        }
        slug
      }
    }
  }
`
