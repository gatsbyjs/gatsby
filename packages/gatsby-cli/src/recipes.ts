import { trackCli } from "gatsby-telemetry"
import runRecipe, { startGraphQLServer } from "gatsby-recipes"

export async function recipesHandler(
  projectRoot: string,
  recipe: string | undefined
): Promise<void> {
  trackCli(`RECIPE_RUN`, { name: recipe })

  const graphql = await startGraphQLServer(projectRoot)

  return runRecipe({
    recipe,
    graphqlPort: graphql.port,
    projectRoot,
  })
}
