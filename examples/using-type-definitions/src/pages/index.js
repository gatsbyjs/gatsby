import React from 'react'
import { Link, graphql } from 'gatsby'

import Layout from '../components/layout'
import SEO from '../components/seo'

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    {data.allAuthorJson.edges.map(({ node }) => (
      <div key={node.id}>
        <h4>
          Posts by {node.firstName} {node.name}
        </h4>
        <ul>
          {node.posts.map(post => (
            <li key={post.id}>{post.title}</li>
          ))}
        </ul>
      </div>
    ))}
    <Link to="/page-2/">Go to page 2</Link>
  </Layout>
)

export default IndexPage

export const query = graphql`
  {
    allAuthorJson {
      edges {
        node {
          id
          name
          firstName
          posts {
            id
            title
          }
        }
      }
    }
  }
`
