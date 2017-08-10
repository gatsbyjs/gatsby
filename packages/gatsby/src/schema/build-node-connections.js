// @flow
const _ = require(`lodash`)
const { connectionArgs, connectionDefinitions } = require(`graphql-skip-limit`)
const { GraphQLInputObjectType } = require(`graphql`)
const {
  inferInputObjectStructureFromNodes,
} = require(`./infer-graphql-input-fields`)
const buildConnectionFields = require(`./build-connection-fields`)
const { getNodes } = require(`../redux`)

module.exports = (types: any) => {
  const connections = {}

  _.each(types, (type /* , fieldName*/) => {
    // Don't create a connection for the Site node since there can only be one
    // of them.
    if (type.name === `Site`) {
      return
    }
    const nodes = type.nodes
    const { connectionType: typeConnection } = connectionDefinitions({
      nodeType: type.nodeObjectType,
      connectionFields: () => buildConnectionFields(type),
    })

    const { sort, inferredFields } = inferInputObjectStructureFromNodes({
      nodes,
      typeName: `${type.name}Connection`,
    })

    connections[_.camelCase(`all ${type.name}`)] = {
      type: typeConnection,
      description: `Connection to all ${type.name} nodes`,
      args: {
        ...connectionArgs,
        sort,
        filter: {
          type: new GraphQLInputObjectType({
            name: _.camelCase(`filter ${type.name}`),
            description: `Filter connection on its fields`,
            fields: () => inferredFields,
          }),
        },
      },
      resolve(object, resolveArgs, b, { rootValue }) {
        let path
        if (typeof rootValue !== `undefined`) {
          path = rootValue.path
        }
        // If path isn't set, this is probably a layout
        if (
          !path &&
          rootValue.componentChunkName &&
          _.includes(rootValue.componentChunkName, `layout`)
        ) {
          path = `LAYOUT___${rootValue.id}`
        }
        const runSift = require(`./run-sift`)
        const latestNodes = _.filter(
          getNodes(),
          n => n.internal.type === type.name
        )
        return runSift({
          args: resolveArgs,
          nodes: latestNodes,
          connection: true,
          path,
        })
      },
    }
  })

  return connections
}
