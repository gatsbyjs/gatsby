import React from "react"
import { Link, graphql } from "gatsby"

import Layout from "../layouts"
import Container from "../components/container"

const AllRecipes = ({ data }) => (
  <Layout>
    <Container>
      <h1>Recipes</h1>
      <ul>
        {data.allRecipes.edges.map(({ node }) => (
          <li key={node.fields.slug}>
            <Link to={node.fields.slug}>{node.title}</Link>
          </li>
        ))}
      </ul>
    </Container>
  </Layout>
)

export default AllRecipes

export const query = graphql`
  query {
    allRecipes(limit: 1000) {
      edges {
        node {
          title
          fields {
            slug
          }
        }
      }
    }
  }
`
