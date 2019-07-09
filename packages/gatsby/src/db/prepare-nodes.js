/**
 * Given a GraphQL Object type and a nested map of fields, run resolve on all
 * the fields that have a resolver and store them inside the storage.
 */

const _ = require(`lodash`)
const {
  isCompositeType,
  getNamedType,
  getNullableType,
  GraphQLList,
} = require(`graphql`)
const withResolverContext = require(`../schema/context`)

async function prepareNodes(
  schemaComposer,
  schema,
  type,
  queryFields,
  fieldsToResolve
) {
  const nodes = require(`./nodes`)
  if (!_.isEmpty(fieldsToResolve)) {
    await nodes.updateNodesByType(type.name, async node => {
      const resolvedFields = await resolveRecursive(
        schemaComposer,
        schema,
        node,
        type,
        queryFields,
        fieldsToResolve
      )
      return {
        ...node,
        $resolved: _.merge(node.$resolved || {}, resolvedFields),
      }
    })
  }
}

module.exports = prepareNodes

async function resolveRecursive(
  schemaComposer,
  schema,
  node,
  type,
  queryFields,
  fieldsToResolve
) {
  const gqlFields = type.getFields()
  let resolvedFields = {}
  for (const fieldName of Object.keys(fieldsToResolve)) {
    const fieldToResolve = fieldsToResolve[fieldName]
    const queryField = queryFields[fieldName]
    const gqlField = gqlFields[fieldName]
    const gqlNonNullType = getNullableType(gqlField.type)
    const gqlFieldType = getNamedType(gqlField.type)
    let innerValue
    if (gqlField.resolve) {
      innerValue = await resolveField(
        schemaComposer,
        schema,
        node,
        gqlField,
        fieldName
      )
    } else {
      innerValue = node[fieldName]
    }
    if (gqlField && innerValue != null) {
      if (
        isCompositeType(gqlFieldType) &&
        !(gqlNonNullType instanceof GraphQLList)
      ) {
        innerValue = await resolveRecursive(
          schemaComposer,
          schema,
          innerValue,
          gqlFieldType,
          queryField,
          _.isObject(fieldToResolve) ? fieldToResolve : queryField
        )
      } else if (
        isCompositeType(gqlFieldType) &&
        _.isArray(innerValue) &&
        gqlNonNullType instanceof GraphQLList
      ) {
        innerValue = await Promise.all(
          innerValue.map(item =>
            resolveRecursive(
              schemaComposer,
              schema,
              item,
              gqlFieldType,
              queryField,
              _.isObject(fieldToResolve) ? fieldToResolve : queryField
            )
          )
        )
      }
    }
    if (innerValue != null) {
      resolvedFields[fieldName] = innerValue
    }
  }

  Object.keys(queryFields).forEach(key => {
    if (!fieldsToResolve[key] && node[key]) {
      resolvedFields[key] = node[key]
    }
  })

  return _.pickBy(resolvedFields, (value, key) => queryFields[key])
}

function resolveField(schemaComposer, schema, node, gqlField, fieldName) {
  return gqlField.resolve(
    node,
    {},
    withResolverContext({}, schema, schemaComposer),
    {
      fieldName,
      schema,
      returnType: gqlField.type,
    }
  )
}
