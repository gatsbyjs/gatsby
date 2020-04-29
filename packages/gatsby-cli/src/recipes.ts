import { trackCli } from "gatsby-telemetry"
import startGraphQLServer from "gatsby-recipes/dist/graphql"

export async function recipesHandler(
  recipe: string | undefined
): Promise<void> {
  trackCli(`RECIPE_RUN`, { name: recipe })

  const graphql = await startGraphQLServer()

  let started = false
  // eslint-disable-next-line no-unused-expressions
  graphql.process.stdout?.on(`data`, () => {
    if (!started) {
      const runRecipe = require(`gatsby-recipes/dist/index.js`)
      runRecipe({
        recipe,
        graphqlPort: graphql.port,
        projectRoot: process.cwd(),
      })
      started = true
    }
  })

  return graphql.process.then(() => {})
}
