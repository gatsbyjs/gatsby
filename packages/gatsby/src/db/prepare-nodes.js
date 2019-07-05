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

async function prepareNodes(schemaComposer, schema, type, fields) {
  const nodes = require(`./nodes`)
  if (!_.isEmpty(fields)) {
    await nodes.updateNodesByType(type.name, async node => {
      const newNode = await resolveRecursive(
        schemaComposer,
        schema,
        node,
        type,
        fields
      )
      // console.log(newNode)
      return newNode
    })
  }
}

module.exports = prepareNodes

async function resolveRecursive(
  schemaComposer,
  schema,
  node,
  type,
  fieldsToResolve
) {
  const gqlFields = type.getFields()
  const resolvedFields = {}
  for (const fieldName of Object.keys(fieldsToResolve)) {
    const fieldToResolve = fieldsToResolve[fieldName]
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
    if (_.isObject(fieldToResolve) && gqlField && innerValue != null) {
      if (
        isCompositeType(gqlFieldType) &&
        !(gqlNonNullType instanceof GraphQLList)
      ) {
        innerValue = await resolveRecursive(
          schemaComposer,
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
            resolveRecursive(
              schemaComposer,
              schema,
              item,
              gqlFieldType,
              fieldToResolve
            )
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

function resolveField(schemaComposer, schema, node, gqlField, fieldName) {
  if (gqlField.resolve) {
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

  return undefined
}
