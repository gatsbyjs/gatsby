/* @jsx jsx */
import { jsx, Flex } from "strict-ui"
import recipesList from "gatsby-recipes/src/recipes-list"
import { Link } from "gatsby"

function Recipes(): JSX.Element {
  return (
    <Flex gap={8} flexDirection="column" sx={{ paddingY: 7, paddingX: 6 }}>
      <Flex gap={6} flexDirection="column">
        <h1>Recipes</h1>
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
                <h2> {recipe.label}</h2>
                <Link to={`/recipe?name=${recipe.value}`}>
                  Recipe GUI for {recipe.value}
                </Link>
              </Flex>
            </li>
          ))}
        </ul>
      </Flex>
    </Flex>
  )
}

export default Recipes
