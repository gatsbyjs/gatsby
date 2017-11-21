/* @flow */
const _ = require(`lodash`)
const { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLNonNull } = require(`graphql`)

const buildNodeTypes = require(`./build-node-types`)
const buildNodeConnections = require(`./build-node-connections`)
const { store } = require(`../redux`)
const invariant = require(`invariant`)

const genExtra = () => {
  console.log(`in the mixer`)
  return {
    search: {
      type: GraphQLString,
      args: {
        text: { type : new GraphQLNonNull(GraphQLString) },
      },
      resolve(root, args) {
        return args.text
      },
    },
  }
}

module.exports = async () => {
  const typesGQL = await buildNodeTypes()
  const connections = buildNodeConnections(_.values(typesGQL))

  // Pull off just the graphql node from each type object.
  const nodes = _.mapValues(typesGQL, `node`)

  invariant(!_.isEmpty(nodes), `There are no available GQL nodes`)
  invariant(!_.isEmpty(connections), `There are no available GQL connections`)

  const extra = genExtra()

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: { ...connections, ...nodes, ...extra },
    }),
  })

  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })
}
