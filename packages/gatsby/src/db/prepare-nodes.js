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
    await nodes.updateNodesByType(gqlType.name, async node => {
      const n = await resolveRecursive(schema, node, gqlType, fields)
      console.log(JSON.stringify(n, null, 2))
      return n
    })
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
    let innerValue
    if (gqlField.resolve) {
      innerValue = await resolveField(schema, node, gqlField, fieldName)
    } else {
      innerValue = node[fieldName]
    }
    if (_.isObject(fieldToResolve) && gqlField && innerValue != null) {
      if (
        isCompositeType(gqlFieldType) &&
        !(gqlNonNullType instanceof GraphQLList)
      ) {
        innerValue = await resolveRecursive(
          schema,
          innerValue,
          gqlFieldType,
          fieldToResolve
        )
      } else if (
        _.isArray(innerValue) &&
        gqlNonNullType instanceof GraphQLList
      ) {
        innerValue = await Promise.all(
          innerValue.map(item =>
            resolveRecursive(schema, item, gqlFieldType, fieldToResolve)
          )
        )
      }
    }
    if (innerValue != null) {
      resolvedFields[fieldName] = innerValue
    }
  }

  const processedFields = {}
  Object.keys(resolvedFields).forEach(key => {
    let resolvedValue
    const value = resolvedFields[key]
    const gqlField = gqlFields[key]
    if (Array.isArray(value)) {
      resolvedValue = []
      value.forEach((item, i) => {
        if (gqlField.resolve) {
          resolvedValue[i] = item
        }

        if (item.$resolved) {
          resolvedValue[i] = {
            ...(resolvedValue[i] || {}),
            ...item.$resolved,
          }
        }
      })
    } else {
      if (gqlField.resolve) {
        resolvedValue = value
      }

      if (value.$resolved) {
        resolvedValue = {
          ...(resolvedValue || {}),
          ...value.$resolved,
        }
      }
    }
    if (resolvedValue) {
      processedFields[key] = resolvedValue
    }
  })

  return {
    ...node,
    $resolved: processedFields,
  }
}

function resolveField(schema, node, gqlField, fieldName) {
  if (gqlField.resolve) {
    return gqlField.resolve(node, {}, withResolverContext({}, schema), {
      fieldName,
      schema,
      returnType: gqlField.type,
    })
  }

  return undefined
}
