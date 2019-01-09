/* @flow */
const _ = require(`lodash`)
const { GraphQLSchema, GraphQLObjectType } = require(`graphql`)
const { mergeSchemas } = require(`graphql-tools`)

const nodeTypes = require(`./build-node-types`)
const nodeConnections = require(`./build-node-connections`)
const { store } = require(`../redux`)
const invariant = require(`invariant`)
const { clearUnionTypes } = require(`./infer-graphql-type`)

function buildNodesSchema(fields) {
  return new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields,
    }),
  })
}
module.exports.buildNodesSchema = buildNodesSchema

module.exports.build = async ({ parentSpan }) => {
  clearUnionTypes()
  const typesGQL = await nodeTypes.buildAll({ parentSpan })
  const connections = nodeConnections.buildAll(_.values(typesGQL))

  // Pull off just the graphql node from each type object.
  const nodes = _.mapValues(typesGQL, `node`)

  invariant(!_.isEmpty(nodes), `There are no available GQL nodes`)
  invariant(!_.isEmpty(connections), `There are no available GQL connections`)

  const thirdPartySchemas = store.getState().thirdPartySchemas || []

  const gatsbySchema = buildNodesSchema({ ...connections, ...nodes })

  const schema = mergeSchemas({
    schemas: [gatsbySchema, ...thirdPartySchemas],
  })

  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })
}
