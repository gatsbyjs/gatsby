/* @jsx jsx */
import { Fragment } from "react"
import { jsx, Flex } from "strict-ui"
import { Heading } from "gatsby-interface"
import recipesList from "gatsby-recipes/src/recipes-list"
import { Link } from "gatsby"

function Recipes(): JSX.Element {
  return (
    <Fragment>
      <Flex gap={8} flexDirection="column" sx={{ paddingY: 7, paddingX: 6 }}>
        <Flex gap={6} flexDirection="column">
          <Heading as="h1">Recipes</Heading>
          <ul sx={{ pl: 0, listStyle: `none` }}>
            {recipesList.map(recipe => (
              <li key={recipe.value}>
                <Flex
                  flexDirection="column"
                  gap={3}
                  sx={{
                    backgroundColor: `ui.background`,
                    padding: 5,
                    borderRadius: 2,
                  }}
                >
                  <Heading as="h3"> {recipe.label}</Heading>
                  <Link to={`/recipe`} state={{ name: recipe.value }}>
                    Recipe GUI for {recipe.value}
                  </Link>
                </Flex>
              </li>
            ))}
          </ul>
        </Flex>
      </Flex>
    </Fragment>
  )
}

export default Recipes
