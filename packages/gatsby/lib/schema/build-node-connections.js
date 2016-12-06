const _ = require(`lodash`)
const {
  GraphQLInt,
  GraphQLList,
  GraphQLString,
} = require(`graphql`)
const {
  connectionArgs,
  connectionDefinitions,
} = require(`graphql-relay`)
const { inferInputObjectStructureFromNodes } = require(`./infer-graphql-input-fields`)
const buildConnectionFields = require(`./build-connection-fields`)

module.exports = (types, typesIR) => {
  const connections = {}

  _.each(types, ((type/*, fieldName*/) => {
    const { connectionType: typeConnection } =
      connectionDefinitions(
        {
          nodeType: type.type,
          connectionFields: () => (buildConnectionFields(nodes, type.type)),
        }
      )

    let nodes = _.find(typesIR, (t) => t.name === type.name).nodes
    const inferredInputFields = inferInputObjectStructureFromNodes(nodes, ``, `${type.name}Connection`)
    connections[_.camelCase(`all${type.name}`)] = {
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
        let resolveNodes = _.find(typesIR, (t) => t.name === type.name).nodes
        return runSift({
          args: resolveArgs,
          nodes,
          connection: true,
        })
      },
    }
  }))

  return connections
}
