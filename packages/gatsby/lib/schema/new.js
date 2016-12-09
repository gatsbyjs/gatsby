/* @flow weak */
const _ = require(`lodash`)
const parents = require(`unist-util-parents`)
const {
  GraphQLSchema,
  GraphQLObjectType,
} = require(`graphql`)

const { programDB } = require(`../utils/globals`)
const siteSchema = require(`./site-schema`)
const apiRunner = require(`../utils/api-runner-node`)
const buildNodeTypes = require(`./build-node-types`)
const buildNodeConnections = require(`./build-node-connections`)

module.exports = async () => {
  console.time(`building ast`)
  const sourceAST = await apiRunner(`sourceNodes`)
  let root = { type: `root`, children: sourceAST }
  // Add parent reference to each source node.
  sourceAST.forEach((sourceNode) => {
    sourceNode.parent = root
  })
  await apiRunner(`modifyAST`, { ast: root })
  // Add parents reference to each node.
  root = parents(root)
  console.timeEnd(`building ast`)

  console.time(`building schema`)
  let typesIntermediateRepresentation = await apiRunner(`registerGraphQLNodes`, { ast: root, programDB })
  typesIntermediateRepresentation = _.flatten(typesIntermediateRepresentation)
  // For each type, infer remaining fields, add node fields, construct type w/
  // node as its interface, and then create various connections.
  const typesGQL = _.merge(...buildNodeTypes(typesIntermediateRepresentation, root))
  const connections = buildNodeConnections(typesGQL, typesIntermediateRepresentation)
  console.timeEnd(`building schema`)

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => ({
        ...typesGQL,
        ...connections,
        ...siteSchema(),
      }),
    }),
  })
  return schema
}
