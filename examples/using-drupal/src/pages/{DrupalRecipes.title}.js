import { graphql } from "gatsby"
import React from "react"
import Img from "gatsby-image"

import Layout from "../layouts"
import Container from "../components/container"
import { rhythm } from "../utils/typography"
import constants from "../utils/constants"

const RecipeTemplate = ({ data }) => (
  <Layout>
    <div
      css={{
        background: constants.paleYellow,
        padding: rhythm(1.5),
        paddingTop: 0,
        marginBottom: rhythm(3),
      }}
    >
      <Container>
        <h1>{data.recipe.title}</h1>
        <p>
          <strong>Category:</strong> {data.recipe.relationships.category.name}
        </p>
        <div
          css={{
            display: `flex`,
            justifyContent: `space-between`,
            marginBottom: rhythm(2),
          }}
        >
          <div css={{ width: `calc(1/2*100% - (1 - 1/2) * ${rhythm(2)})` }}>
            <Img
              fluid={
                data.recipe.relationships.image.relationships.imageFile
                  .localFile.childImageSharp.fluid
              }
            />
          </div>
          <div css={{ width: `calc(1/2*100% - (1 - 1/2) * ${rhythm(2)})` }}>
            <div>
              <strong>Preparation time:</strong>
            </div>
            <div>{data.recipe.preparationTime} minutes</div>
            <div>
              <strong>Cooking time:</strong>
            </div>
            <div>{data.recipe.totalTime} minutes</div>
            <div>
              <strong>Difficulty:</strong>
            </div>
            <div>{data.recipe.difficulty}</div>
          </div>
        </div>
        <div css={{ background: `white`, padding: rhythm(1.5) }}>
          <h2>What {`you'll`} need and how to make this dish</h2>
          <div css={{ display: `flex`, justifyContent: `space-between` }}>
            <div css={{ width: `calc(1/2*100% - (1 - 1/2) * ${rhythm(1.5)})` }}>
              <h3>Ingredients</h3>
              <ul>
                {data.recipe.ingredients &&
                  data.recipe.ingredients.map((ing, index) => (
                    <li key={index}>{ing}</li>
                  ))}
              </ul>
            </div>
            <div css={{ width: `calc(1/2*100% - (1 - 1/2) * ${rhythm(1.5)})` }}>
              <h3>Method</h3>
              <ul>
                {data.recipe.instructions &&
                  data.recipe.instructions
                    .split(`.,`)
                    .map(i => <li key={i}>{i}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </div>
  </Layout>
)

export default RecipeTemplate

export const query = graphql`
  query ($id: String!) {
    recipe: drupalRecipes(id: { eq: $id }) {
      title
      preparationTime
      difficulty
      totalTime
      ingredients
      instructions
      relationships {
        category {
          name
        }
        image {
          relationships {
            imageFile {
              localFile {
                childImageSharp {
                  fluid(maxWidth: 470, maxHeight: 353) {
                    ...GatsbyImageSharpFluid
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`
