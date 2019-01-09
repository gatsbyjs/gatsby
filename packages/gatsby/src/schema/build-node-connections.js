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
const buildSortArg = require(`./create-sort-field`)
const buildConnectionFields = require(`./build-connection-fields`)
const createPageDependency = require(`../redux/actions/add-page-dependency`)
const { connectionFromArray } = require(`graphql-skip-limit`)
const { run: runQuery } = require(`../db/nodes-query`)

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

function buildResolver(gqlType) {
  return async (object, queryArgs, b, { rootValue }) => {
    let path
    if (typeof rootValue !== `undefined`) {
      path = rootValue.path
    }
    const results = await runQuery({
      queryArgs,
      firstOnly: false,
      gqlType,
    })
    return handleQueryResult({ results, queryArgs, path })
  }
}

function buildFilterArg(typeName, filterFields) {
  return {
    type: new GraphQLInputObjectType({
      name: _.camelCase(`filter ${typeName}`),
      description: `Filter connection on its fields`,
      fields: () => filterFields,
    }),
  }
}

function buildFieldConfig(processedType) {
  const { nodes, nodeObjectType } = processedType
  const typeName = `${processedType.name}Connection`
  const { connectionType: outputType } = connectionDefinitions({
    nodeType: nodeObjectType,
    connectionFields: () => buildConnectionFields(processedType),
  })

  const inferredInputFieldsFromNodes = inferInputObjectStructureFromNodes({
    nodes,
    typeName,
  })

  const inferredInputFieldsFromPlugins = inferInputObjectStructureFromFields({
    fields: processedType.fieldsFromPlugins,
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

  const argsMap = {
    ...connectionArgs,
    sort: buildSortArg(typeName, sortNames),
    filter: buildFilterArg(processedType.name, filterFields),
  }

  return {
    type: outputType,
    description: `Connection to all ${processedType.name} nodes`,
    args: argsMap,
    resolve: buildResolver(nodeObjectType),
  }
}

function buildFieldConfigMap(processedType) {
  const fieldName = _.camelCase(`all ${processedType.name}`)
  const fieldConfig = buildFieldConfig(processedType)
  return { [fieldName]: fieldConfig }
}

function fieldConfigReducer(fieldConfigMap, type) {
  return Object.assign(fieldConfigMap, buildFieldConfigMap(type))
}

function buildAll(processedTypes) {
  return processedTypes
    .filter(type => type.name !== `Site`)
    .reduce(fieldConfigReducer, {})
}

module.exports = {
  buildFieldConfig,
  buildFieldConfigMap,
  buildAll,
}
