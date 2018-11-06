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
const { createPageDependency } = require(`../redux/actions/add-page-dependency`)
const { connectionFromArray } = require(`graphql-skip-limit`)
const { runQuery } = require(`../db/nodes`)

function handleQueryResult({ results, queryArgs, path }) {
  if (results && results.length) {
    const connection = connectionFromArray(results, queryArgs)
    connection.totalCount = results.length

    if (results[0].internal) {
      const connectionType = connection.edges[0].node.internal.type
      createPageDependency({
        path,
        connection: connectionType,
      })
    }
    return connection
  } else {
    return null
  }
}

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
      async resolve(object, queryArgs, b, { rootValue }) {
        let path
        if (typeof rootValue !== `undefined`) {
          path = rootValue.path
        }
        const results = await runQuery({
          queryArgs,
          firstOnly: false,
          gqlType: type.node.type,
        })
        return handleQueryResult({ results, queryArgs, path })
      },
    }
  })

  return connections
}
