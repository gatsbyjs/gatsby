import React from "react"
import Link from "gatsby-link"
import gray from "gray-percentage"
import Img from "gatsby-image"

import Container from "../components/container"
import { rhythm } from "../utils/typography"
import constants from "../utils/constants"

class IndexPage extends React.Component {
  render() {
    console.log(this.props)
    const data = this.props.data
    const topRecipe = data.topRecipe.edges[0].node
    const nextTwoPromotedRecipes = data.nextTwoPromotedRecipes.edges.map(
      edge => edge.node
    )

    const FirstPromoted = ({ recipe }) => (
      <div
        css={{
          border: `1px solid ${gray(80)}`,
          width: 400,
        }}
      >
        <div
          css={{
            display: `inline-block`,
            padding: `${rhythm(3 / 4)} ${rhythm(1)}`,
          }}
        >
          <h4
            css={{
              fontFamily: `"Josefin Sans", sans-serif`,
              fontWeight: 400,
              margin: 0,
              color: gray(50),
            }}
          >
            Our Recipe Pick
          </h4>
          <h2>{recipe.title}</h2>
        </div>
        <Img
          css={{ position: `relative`, left: -1, bottom: -1, margin: 0 }}
          resolutions={
            recipe.relationships.image.relationships.imageFile.localFile
              .childImageSharp.resolutions
          }
        />
      </div>
    )

    const TopPromoted = ({ recipe }) => (
      <div
        css={{
          display: `inline-block`,
          border: `1px solid ${gray(80)}`,
          width: 207,
        }}
      >
        <Img
          css={{ position: `relative`, left: -1, top: -1, margin: 0 }}
          resolutions={
            recipe.relationships.image.relationships.imageFile.localFile
              .childImageSharp.resolutions
          }
        />
        <div
          css={{
            padding: `${rhythm(3 / 4)} ${rhythm(1)}`,
            height: 207,
            width: 207,
          }}
        >
          <h4
            css={{
              fontFamily: `"Josefin Sans", sans-serif`,
              fontWeight: 400,
              marginBottom: rhythm(1 / 4),
              color: gray(50),
            }}
          >
            {recipe.relationships.category.name}
          </h4>
          <h3>{recipe.title}</h3>
        </div>
      </div>
    )

    return (
      <div css={{ overflow: `hidden` }}>
        <Container>
          <div css={{ display: `flex`, justifyContent: `space-between` }}>
            <FirstPromoted recipe={topRecipe} />
            {nextTwoPromotedRecipes.map(recipe => (
              <TopPromoted recipe={recipe} />
            ))}
          </div>
        </Container>

        <div
          css={{
            background: constants.darkYellow,
          }}
        >
          <Container
            css={{
              paddingTop: rhythm(2),
              paddingBottom: rhythm(2),
              paddingLeft: rhythm(2),
            }}
          >
            <div css={{ maxWidth: rhythm(15) }}>
              <h2>In this month's edition</h2>
              <p>
                Quisque vitae pulvinar arcu. Aliquam ac pellentesque erat, at
                finibus massa.
              </p>
              <p>
                {" "}
                Suspendisse eget • leo sed • felis commodo • semper id • sed
                erat
              </p>
              <button
                css={{
                  background: constants.darkGray,
                  color: gray(75, 0, true),
                  padding: `${rhythm(1 / 3)} ${rhythm(2 / 3)}`,
                  lineHeight: 1.3,
                  cursor: `pointer`,
                }}
              >
                More Umami
              </button>
            </div>
          </Container>
        </div>

        <div
          css={{
            background: constants.paleYellow,
          }}
        >
          <Container
            css={{
              paddingTop: rhythm(2),
              paddingBottom: rhythm(2),
            }}
          >
            <h1 css={{ textAlign: `center` }}>Recipes</h1>
            <h2 css={{ textAlign: `center` }}>
              Explore recipes across every type of occassion, ingredients, and
              skill level
            </h2>
          </Container>
        </div>
      </div>
    )
  }
}

export default IndexPage

export const pageQuery = graphql`
  query IndexPageQuery {
    topRecipe: allRecipes(sort: { fields: [createdAt] }, limit: 1) {
      edges {
        node {
          title
          relationships {
            image {
              relationships {
                imageFile {
                  localFile {
                    childImageSharp {
                      resolutions(width: 400, height: 300) {
                        ...GatsbyImageSharpResolutions
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    nextTwoPromotedRecipes: allRecipes(
      sort: { fields: [createdAt] }
      limit: 2
      skip: 1
    ) {
      edges {
        node {
          title
          relationships {
            category {
              name
            }
            image {
              relationships {
                imageFile {
                  localFile {
                    childImageSharp {
                      resolutions(width: 207, height: 207) {
                        ...GatsbyImageSharpResolutions
                      }
                    }
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
