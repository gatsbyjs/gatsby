const { graphql } = require(`graphql`)

const { store } = require(`../../redux`)
const resolvers = require(`../../schema/resolvers`)

module.exports = (query, context) => {
  const { schema } = store.getState()
  return graphql(schema, query, context, { ...context, resolvers }, context)
}
