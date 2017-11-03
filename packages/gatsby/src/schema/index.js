/* @flow */
const _ = require(`lodash`)
const { GraphQLSchema, GraphQLObjectType } = require(`graphql`)

const { createPageDependency } = require(`../redux/actions/add-page-dependency`)
const redux = require(`../redux`)
const apiRunner = require(`../utils/api-runner-node`)
const { buildNodeTypes, buildNodeConnections } = require(`gatsby-infer-schema`)
const { store } = require(`../redux`)
const invariant = require(`invariant`)
const { joinPath } = require(`../utils/path`)

module.exports = async () => {
  const typesGQL = await buildNodeTypes(createPageDependency, redux, joinPath, apiRunner)
  const connections = buildNodeConnections(_.values(typesGQL), redux.getNodes, createPageDependency)

  // Pull off just the graphql node from each type object.
  const nodes = _.mapValues(typesGQL, `node`)

  invariant(!_.isEmpty(nodes), `There are no available GQL nodes`)
  invariant(!_.isEmpty(connections), `There are no available GQL connections`)

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: { ...connections, ...nodes },
    }),
  })

  store.dispatch({
    type: `SET_SCHEMA`,
    payload: schema,
  })
}
