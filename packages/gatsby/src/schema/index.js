/* @flow */
const _ = require(`lodash`)
const { GraphQLSchema, GraphQLObjectType } = require(`graphql`)

const buildNodeTypes = require(`./build-node-types`)
const buildNodeConnections = require(`./build-node-connections`)
const { store } = require(`../redux`)

module.exports = async () => {
  const typesGQL = await buildNodeTypes()
  const connections = buildNodeConnections(_.values(typesGQL))

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => {
        return {
          // Pull off just the graphql node from each type object.
          ..._.mapValues(typesGQL, `node`),
          ...connections,
        }
      },
    }),
  })

  console.timeEnd(`building schema`)
  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })

  return
}
