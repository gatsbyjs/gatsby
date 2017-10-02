// @flow
const _ = require(`lodash`)
const { connectionArgs, connectionDefinitions } = require(`graphql-skip-limit`)
const { GraphQLInputObjectType } = require(`graphql`)
const {
  inferInputObjectStructureFromNodes,
} = require(`./infer-graphql-input-fields`)
const {
  inferInputObjectStructureFromFields,
} = require(`./infer-graphql-input-fields-from-fields`)
const createSortField = require(`./create-sort-field`)
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
    const typeName = `${type.name}Connection`
    const { connectionType: typeConnection } = connectionDefinitions({
      nodeType: type.nodeObjectType,
      connectionFields: () => buildConnectionFields(type),
    })

    const inferredInputFieldsFromNodes = inferInputObjectStructureFromNodes({
      nodes,
      typeName,
    })

    const inferredInputFieldsFromPlugins = inferInputObjectStructureFromFields({
      fields: type.fieldsFromPlugins,
      typeName,
    })

    const filterFields = _.merge(
      {},
      inferredInputFieldsFromNodes.inferredFields,
      inferredInputFieldsFromPlugins.inferredFields
    )
    const sortNames = inferredInputFieldsFromNodes.sort.concat(
      inferredInputFieldsFromPlugins.sort
    )
    const sort = createSortField(typeName, sortNames)

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
            fields: () => filterFields,
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
          rootValue &&
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
          type: type.node.type,
        })
      },
    }
  })

  return connections
}
