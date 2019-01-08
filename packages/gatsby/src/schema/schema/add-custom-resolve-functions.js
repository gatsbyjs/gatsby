const { schemaComposer } = require(`graphql-compose`)

const apiRunner = require(`../../utils/api-runner-node`)

const addResolvers = resolvers => schemaComposer.addResolveMethods(resolvers)

const addCustomResolveFunctions = () =>
  apiRunner(`addResolvers`, { addResolvers })

module.exports = addCustomResolveFunctions
