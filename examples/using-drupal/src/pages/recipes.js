import React from "react"
import { Link } from "gatsby"

import Container from "../components/container"
import { rhythm } from "../utils/typography"

const AllRecipes = ({ data }) => (
  <Container>
    <h1>Recipes</h1>
    <ul>
      {data.allRecipes.edges.map(({ node }) => (
        <li>
          <Link to={node.fields.slug}>{node.title}</Link>
        </li>
      ))}
    </ul>
  </Container>
)

export default AllRecipes

export const query = graphql`
  query AllRecipes {
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
