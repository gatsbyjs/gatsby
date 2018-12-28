/**
 * Nodes in the store don't have fields which are
 * - added in `setFieldsOnGraphQLNodeType`
 * - added in `@link` directive.
 * Therefore we need to resolve those fields so they are
 * available for querying.
 */

const { schemaComposer } = require(`graphql-compose`)
const { GraphQLNonNull } = require(`graphql`)

const { getNodesByType } = require(`../db`)
const { dropQueryOperators } = require(`../query`)
const { isProductionBuild } = require(`../utils`)
const { trackObjects } = require(`../utils/node-tracking`)

const { emitter } = require(`../../redux`)
let isBootstrapFinished = false
emitter.on(`BOOTSTRAP_FINISHED`, () => (isBootstrapFinished = true))

const cache = new Map()
const nodeCache = new Map()

// TODO: Filter sparse arrays?
const resolveValue = (value, filterValue, type) => {
  const nullableType = type instanceof GraphQLNonNull ? type.ofType : type
  // FIXME: We probably have to check that node data and schema are actually in sync,
  // wrt arrays/scalars.
  // return Array.isArray(value) && nullableType instanceof GraphQLList
  return Array.isArray(value)
    ? Promise.all(
        value.map(item => resolveValue(item, filterValue, nullableType.ofType))
      )
    : prepareForQuery(value, filterValue, nullableType)
}

const prepareForQuery = (node, filter, parentType) => {
  const fields = parentType.getFields()

  const queryNode = Object.entries(filter).reduce(
    async (acc, [fieldName, filterValue]) => {
      const node = await acc
      // FIXME: What is the expectation here if this is null?
      // Continue and call the field resolver or not?
      if (node[fieldName] == null) return node

      const { resolve, type } = fields[fieldName]

      if (typeof resolve === `function`) {
        node[fieldName] = await resolve(
          node,
          {},
          {},
          { fieldName, fieldNodes: [{}], parentType, returnType: type }
        )
      }

      // `dropQueryOperators` sets value to `true` for leaf values.
      // Maybe be more explicit: `const isLeaf = !isObject(filterValue)`
      const isLeaf = filterValue === true
      const value = node[fieldName]

      if (!isLeaf && value != null) {
        node[fieldName] = await resolveValue(value, filterValue, type)
      }

      return node
    },
    { ...node }
  )
  return queryNode
}

const getNodesForQuery = async (type, filter) => {
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

  // Use executable schema from store (includes resolvers added by @link directive).
  // Alternatively, call @link resolvers manually (@see 4f5df2dca5665d7d13da6daf456d5302fc9274b7).
  const { GraphQLSchema } = require(`graphql`)
  const { schema } = require(`../../redux`).store.getState()

  // FIXME: In testing, when no schema is built yet, use schemaComposer.
  // Should mock store in tests instead.
  const parentType =
    schema instanceof GraphQLSchema
      ? schema.getType(type)
      : schemaComposer.getTC(type).getType()

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

      const queryNode = prepareForQuery(node, filterFields, parentType)

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
