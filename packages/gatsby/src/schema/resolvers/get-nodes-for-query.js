const { GraphQLNonNull } = require(`graphql`)

const { store } = require(`../../redux`)
const { getNodesByType } = require(`../db`)
const { dropQueryOperators } = require(`../query`)
const { hasResolvers, isProductionBuild } = require(`../utils`)
const { trackObjects } = require(`../utils/node-tracking`)

const { emitter } = require(`../../redux`)
let isBootstrapFinished = false
emitter.on(`BOOTSTRAP_FINISHED`, () => (isBootstrapFinished = true))

const cache = new Map()
const nodeCache = new Map()

const resolveValue = (value, filterValue, type, context, schema) => {
  // TODO: Use const { getNullableType } = require(`graphql`)
  const nullableType = type instanceof GraphQLNonNull ? type.ofType : type
  return Array.isArray(value)
    ? Promise.all(
        value.map(item =>
          resolveValue(item, filterValue, nullableType.ofType, context, schema)
        )
      )
    : prepareForQuery(value, filterValue, nullableType, context, schema)
}

const prepareForQuery = (node, filter, parentType, context, schema) => {
  const fields = parentType.getFields()

  const queryNode = Object.entries(filter).reduce(
    async (acc, [fieldName, filterValue]) => {
      const node = await acc

      const { type, args, resolve } = fields[fieldName]

      if (typeof resolve === `function`) {
        const defaultValues = args.reduce((acc, { name, defaultValue }) => {
          acc[name] = defaultValue
          return acc
        }, {})
        node[fieldName] = await resolve(node, defaultValues, context, {
          fieldName,
          parentType,
          returnType: type,
          schema,
        })
      }

      // `dropQueryOperators` sets value to `true` for leaf values.
      const isLeaf = filterValue === true
      const value = node[fieldName]

      if (!isLeaf && value != null) {
        node[fieldName] = await resolveValue(
          value,
          filterValue,
          type,
          context,
          schema
        )
      }

      return node
    },
    { ...node }
  )
  return queryNode
}

const getNodesForQuery = async (type, filter, context) => {
  const nodes = await getNodesByType(type)

  if (!filter) return nodes

  const filterFields = dropQueryOperators(filter)

  let cacheKey
  if (isProductionBuild || !isBootstrapFinished) {
    cacheKey = JSON.stringify({ type, count: nodes.length, filterFields })
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }
  }

  const { schema } = store.getState()
  const parentType = schema.getType(type)

  // If there are no resolvers to call manually, we can just return nodes.
  if (!hasResolvers(parentType, filterFields)) {
    return nodes
  }

  const queryNodes = Promise.all(
    nodes.map(async node => {
      const cacheKey = JSON.stringify({
        id: node.id,
        digest: node.internal.contentDigest,
        filterFields,
      })
      if (nodeCache.has(cacheKey)) {
        return nodeCache.get(cacheKey)
      }

      const queryNode = prepareForQuery(
        node,
        filterFields,
        parentType,
        context,
        schema
      )

      nodeCache.set(cacheKey, queryNode)
      trackObjects(await queryNode)
      return queryNode
    })
  )

  if (isProductionBuild || !isBootstrapFinished) {
    cache.set(cacheKey, queryNodes)
  }

  return queryNodes
}

module.exports = getNodesForQuery
