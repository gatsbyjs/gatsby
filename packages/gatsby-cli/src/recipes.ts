import { trackCli } from "gatsby-telemetry"
import startGraphQLServer from "gatsby-recipes/dist/graphql"

export async function recipesHandler(
  recipe: string | undefined
): Promise<void> {
  trackCli(`RECIPE_RUN`, { name: recipe })

  const projectRoot = process.cwd()
  const graphql = await startGraphQLServer(projectRoot)

  const runRecipe = require(`gatsby-recipes/dist/index.js`)
  return runRecipe({
    recipe,
    graphqlPort: graphql.port,
    projectRoot,
  })
}
