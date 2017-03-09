/* @flow weak */
const _ = require("lodash")
const parents = require("unist-util-parents")
const {
  GraphQLSchema,
  GraphQLObjectType,
} = require("graphql")

const { programDB } = require("../utils/globals")
const siteSchema = require("./site-schema")
const apiRunner = require("../utils/api-runner-node")
const buildNodeTypes = require("./build-node-types")
const buildNodeConnections = require("./build-node-connections")

module.exports = async () => {
  console.time(`building ast`)
  const sourceAST = await apiRunner(`sourceNodes`)
  let root = { type: `root`, children: sourceAST }
  // Add parent reference to each source node.
  sourceAST.forEach(sourceNode => {
    sourceNode.parent = root
  })
  await apiRunner(`modifyAST`, { ast: root })
  // Add parents reference to each node.
  root = parents(root)
  console.timeEnd(`building ast`)

  console.time(`building schema`)
  // For each type in the AST, create a graphql field, by first infering fields
  // from fields in AST nodes and then allowing plugins to add additional node
  // fields, then create connections for each node type.
  // [ { type, nodes, name } ]
  const typesGQL = await buildNodeTypes(root)
  const connections = buildNodeConnections(_.values(typesGQL))
  console.timeEnd(`building schema`)

  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => ({
        // Pull off just the graphql node from each type object.
        ..._.mapValues(typesGQL, `node`),
        ...connections,
        ...siteSchema(),
      }),
    }),
  })
  return schema
}
