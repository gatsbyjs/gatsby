import { trackCli } from "gatsby-telemetry"
import runRecipe, { startGraphQLServer } from "gatsby-recipes"

export async function recipesHandler(
  projectRoot: string,
  recipe: string | undefined,
  develop: boolean
): Promise<void> {
  trackCli(`RECIPE_RUN`, { name: recipe })

  const graphql = await startGraphQLServer(projectRoot)

  return runRecipe({
    recipe,
    isDevelopMode: develop,
    graphqlPort: graphql.port,
    projectRoot,
  })
}
