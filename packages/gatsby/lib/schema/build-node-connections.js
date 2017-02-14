const _ = require(`lodash`)
const {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
} = require(`graphql`)
const {
  connectionArgs,
  connectionDefinitions,
} = require(`graphql-skip-limit`)
const { inferInputObjectStructureFromNodes } = require(
  `./infer-graphql-input-fields`,
)
const buildConnectionFields = require(`./build-connection-fields`)

module.exports = types => {
  const connections = {}

  _.each(types, (type /*, fieldName*/) => {
    const nodes = type.nodes
    const { connectionType: typeConnection } = connectionDefinitions({
      nodeType: type.nodeObjectType,
      connectionFields: () => buildConnectionFields(type),
    })

    const inferredInputFields = inferInputObjectStructureFromNodes(
      nodes,
      ``,
      `${type.name}Connection`,
    )
    connections[_.camelCase(`all ${type.name}`)] = {
      type: typeConnection,
      description: `Connection to all ${type.name} nodes`,
      args: {
        // TODO infer (same?) args for input as for on the node.
        // probably could use the same filtering function as for a node
        // would just take the first one as the result and for a connection
        // return all of them.
        ...connectionArgs,
        ...inferredInputFields,
      },
      resolve (object, resolveArgs) {
        const runSift = require(`./run-sift`)
        return runSift({
          args: resolveArgs,
          nodes,
          connection: true,
        })
      },
    }
  })

  return connections
}
