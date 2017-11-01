import React from "react"
import Img from "gatsby-image"

import Container from "../components/container"
import { rhythm } from "../utils/typography"
import constants from "../utils/constants"

const RecipeTemplate = ({ data }) => (
  <div
    css={{
      background: constants.paleYellow,
      padding: rhythm(1.5),
      paddingTop: 0,
      marginBottom: rhythm(3),
    }}
  >
    <Container>
      <h1>{data.recipes.title}</h1>
      <p>
        <strong>Category:</strong> {data.recipes.relationships.category.name}
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
            sizes={
              data.recipes.relationships.image.relationships.imageFile.localFile
                .childImageSharp.sizes
            }
          />
        </div>
        <div css={{ width: `calc(1/2*100% - (1 - 1/2) * ${rhythm(2)})` }}>
          <div>
            <strong>Preparation time:</strong>
          </div>
          <div>{data.recipes.preparationTime} minutes</div>
          <div>
            <strong>Cooking time:</strong>
          </div>
          <div>{data.recipes.totalTime} minutes</div>
          <div>
            <strong>Difficulty:</strong>
          </div>
          <div>{data.recipes.difficulty}</div>
        </div>
      </div>
      <div css={{ background: `white`, padding: rhythm(1.5) }}>
        <h2>What you'll need and how to make this dish</h2>
        <div css={{ display: `flex`, justifyContent: `space-between` }}>
          <div css={{ width: `calc(1/2*100% - (1 - 1/2) * ${rhythm(1.5)})` }}>
            <h3>Ingredients</h3>
            <ul>
              {data.recipes.ingredients &&
                data.recipes.ingredients.map(ing => <li>{ing}</li>)}
            </ul>
          </div>
          <div css={{ width: `calc(1/2*100% - (1 - 1/2) * ${rhythm(1.5)})` }}>
            <h3>Method</h3>
            <ul>
              {data.recipes.instructions &&
                data.recipes.instructions.split(`,`).map(i => <li>{i}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </Container>
  </div>
)

export default RecipeTemplate

export const query = graphql`
  query RecipeTemplate($slug: String!) {
    recipes(fields: { slug: { eq: $slug } }) {
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
                  sizes(maxWidth: 470, maxHeight: 353) {
                    ...GatsbyImageSharpSizes
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
