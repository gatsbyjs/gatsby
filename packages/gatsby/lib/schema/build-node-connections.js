const _ = require(`lodash`)
const {
  GraphQLInt,
} = require(`graphql`)
const {
  connectionFromArray,
  connectionArgs,
  connectionDefinitions,
} = require(`graphql-relay`)

module.exports = (types, typesIR) => {
  const connections = {}

  _.each(types, ((type/*, fieldName*/) => {
    const { connectionType: typeConnection } =
      connectionDefinitions(
        {
          nodeType: type.type,
          connectionFields: () => ({
            totalCount: {
              type: GraphQLInt,
            },
          }),
        }
      )

    connections[_.camelCase(`all${type.name}`)] = {
      type: typeConnection,
      description: `Connection to all ${type.name} nodes`,
      args: {
        ...connectionArgs,
      },
      resolve (object, resolveArgs) {
        const nodes = _.find(typesIR, (t) => t.name === type.name).nodes
        const result = connectionFromArray(
          nodes,
          resolveArgs,
        )
        result.totalCount = nodes.length
        return result
      },
    }
  }))

  return connections
}
