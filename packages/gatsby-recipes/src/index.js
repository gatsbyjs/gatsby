import cli from "./cli"
import startGraphQLServer from "./graphql-server"

// data = { recipe?: string, graphqlPort: number, projectRoot: string }
const recipesHandler = async data => cli(data)

export { startGraphQLServer, recipesHandler }
