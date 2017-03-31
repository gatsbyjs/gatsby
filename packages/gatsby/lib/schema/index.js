/* @flow */
const _ = require("lodash")
const parents = require("unist-util-parents")
const {
  GraphQLSchema,
  GraphQLObjectType,
} = require("graphql")

const { rootDataTree } = require("../utils/globals")
const siteSchema = require("./site-schema")
const apiRunner = require("../utils/api-runner-node")
const buildNodeTypes = require("./build-node-types")
const buildNodeConnections = require("./build-node-connections")
import { store } from "../redux"

async function mutateDataTree(nodes) {
  let root = { type: `root`, children: nodes }

  // Add parent reference to each source node.
  nodes.forEach(sourceNode => {
    sourceNode.parent = root
  })

  await apiRunner(`mutateDataTree`, { dataTree: root })

  // Add parents reference to each node.
  root = parents(root)
  console.timeEnd(`building DataTree`)
  rootDataTree(root)
  return root
}

async function buildSchema(root) {
  console.time(`building schema`)
  // For each type in the DataTree, create a graphql field, by first infering fields
  // from fields in DataTree nodes and then allowing plugins to add additional node
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

async function upsertNode(node) {
  await apiRunner(`mutateDataNode`, { node })
  let root = rootDataTree()

  // Replace source node.
  const children = root.children
  const index = _.findIndex(children, childNode => childNode.id === node.id)
  children[index] = node
  mutateDataTree(children)
}

module.exports = async () => {
  console.time(`building DataTree`)
  let nodes = await apiRunner(`sourceNodes`, { upsertNode })
  nodes = _.flatten(nodes)
  await Promise.all(nodes.map(node => apiRunner(`mutateDataNode`, { node })))
  const root = await mutateDataTree(nodes)
  return await buildSchema(root)
}
