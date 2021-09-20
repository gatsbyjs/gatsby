import React from "react"
import { StaticQuery, graphql, Link } from "gatsby"
import Layout from "../components/layout_1"

const IndexPage = () => (
  <Layout>
    <StaticQuery
      query={graphql`
        query {
          allStrapiArticle {
            edges {
              node {
                id
                title
              }
            }
          }
        }
      `}
      render={data => (
        <div>
          <div>
            <h1>All articles</h1>
            <ul>
              {data.allStrapiArticle.edges.map((article) => {
                return (
                  <li key={article.node.id}>
                    <Link to={`/article/${article.node.id}`}>
                      <p>{article.node.title}</p>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      )}
    />
  </Layout>
)

export default IndexPage
