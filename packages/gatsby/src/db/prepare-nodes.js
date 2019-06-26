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

async function prepareNodes(schema, gqlType, fields) {
  const nodes = require(`./nodes`)
  if (!_.isEmpty(fields)) {
    await nodes.updateNodesByType(gqlType.name, node =>
      resolveRecursive(schema, node, gqlType, fields)
    )
  }
}

module.exports = prepareNodes

async function resolveRecursive(schema, node, gqlType, fieldsToResolve) {
  const gqlFields = gqlType.getFields()
  const resolvedFields = {}
  for (const fieldName of Object.keys(fieldsToResolve)) {
    const fieldToResolve = fieldsToResolve[fieldName]
    const gqlField = gqlFields[fieldName]
    const gqlNonNullType = getNullableType(gqlField.type)
    const gqlFieldType = getNamedType(gqlField.type)
    const field = await resolveField(schema, node, gqlField, fieldName)
    let innerValue = field
    if (_.isObject(fieldToResolve) && gqlField && field != null) {
      if (
        isCompositeType(gqlFieldType) &&
        !(gqlNonNullType instanceof GraphQLList)
      ) {
        innerValue = await resolveRecursive(
          schema,
          field,
          gqlFieldType,
          fieldToResolve
        )
      } else if (_.isArray(field) && gqlNonNullType instanceof GraphQLList) {
        innerValue = await Promise.all(
          field.map(item =>
            resolveRecursive(schema, item, gqlFieldType, fieldToResolve)
          )
        )
      }
    }
    resolvedFields[fieldName] = innerValue
  }
  return {
    ...node,
    $resolved: resolvedFields,
  }
}

function resolveField(schema, node, gqlField, fieldName) {
  if (gqlField.resolve) {
    return gqlField.resolve(node, {}, withResolverContext({}, schema), {
      fieldName,
      schema,
      returnType: gqlField.type,
    })
  } else if (node[fieldName] !== undefined) {
    return node[fieldName]
  }

  return undefined
}
