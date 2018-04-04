/* @flow */
const _ = require(`lodash`)
const { GraphQLSchema, GraphQLObjectType } = require(`graphql`)

const apiRunner = require(`../utils/api-runner-node`)
const buildNodeTypes = require(`./build-node-types`)
const buildNodeConnections = require(`./build-node-connections`)
const { store, getNodes } = require(`../redux`)
const invariant = require(`invariant`)

async function getEnhancedGqlFields(typesGQL) {
  const enhancedFields = await apiRunner(`enhanceSchema`, {
    types: typesGQL,
    allNodes: getNodes(),
    traceId: `initial-enhanceSchema`,
  })
  return enhancedFields
}

module.exports = async () => {
  const typesGQL = await buildNodeTypes()
  let enhancedFields = {}
  const enhancedFieldResults = await getEnhancedGqlFields(typesGQL)
  Object.keys(enhancedFieldResults).forEach(key => {
    enhancedFields = {
      ...enhancedFields,
      ...enhancedFieldResults[key],
    }
  })

  const connections = buildNodeConnections(_.values(typesGQL))

  // Pull off just the graphql node from each type object.
  const nodes = _.mapValues(typesGQL, `node`)

  invariant(!_.isEmpty(nodes), `There are no available GQL nodes`)
  invariant(!_.isEmpty(connections), `There are no available GQL connections`)

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: { ...connections, ...nodes, ...enhancedFields },
    }),
  })

  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })
}
