import cli from "./cli"

export { startGraphQLServer } from "./graphql-server"

// data = { recipe?: string, graphqlPort: number, projectRoot: string }
const recipesHandler = async data => cli(data)

export default recipesHandler
