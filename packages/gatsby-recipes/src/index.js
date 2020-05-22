export { startGraphQLServer } from "./graphql-server"

// data = { recipe?: string, graphqlPort: number, projectRoot: string }
const recipesHandler = async data => {
  const cli = require(`import-jsx`)(require.resolve(`./cli`))
  return cli(data)
}

export default recipesHandler
