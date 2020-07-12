import * as React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../components/layout"
import SEO from "../components/seo"

const IndexPage = ({ data }) => (
  <Layout>
    <SEO title="Home" keywords={[`gatsby`, `application`, `react`]} />
    <h1>Hi people</h1>
    <p>Welcome to your new Gatsby site.</p>
    <p>Now go build something great.</p>
    <div>
      {data.allAuthorJson.edges.map(({ node }) => (
        <div key={node.id}>
          <h4>
            Posts by {node.firstName} {node.name}
          </h4>
          <ul>
            {node.posts.map(post => (
              <li key={post.id}>
                <h5>{post.title}</h5>
                <ul>
                  {post.comments.map((comment, i) => (
                    <li key={i}>
                      <b>{comment.author.name}</b> - {comment.text}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>

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
            comments {
              text
              author {
                name
              }
            }
          }
        }
      }
    }
  }
`
