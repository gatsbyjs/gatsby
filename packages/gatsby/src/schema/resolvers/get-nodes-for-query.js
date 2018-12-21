const { schemaComposer } = require(`graphql-compose`)

const { getNodesByType } = require(`../db`)
const { dropQueryOperators } = require(`../query`)
const { isProductionBuild } = require(`../utils`)
const { trackObjects } = require(`../utils/node-tracking`)

const cache = new Map()
const nodeCache = new Map()

// TODO: Filter sparse arrays?
const resolveValue = (value, filterValue, fieldTC) =>
  Array.isArray(value)
    ? Promise.all(value.map(item => resolveValue(item, filterValue, fieldTC)))
    : prepareForQuery(value, filterValue, fieldTC)

const prepareForQuery = (node, filter, tc) => {
  // FIXME: Make this a .map() instead of .reduce()
  const queryNode = Object.entries(filter).reduce(
    async (acc, [fieldName, filterValue]) => {
      const node = await acc
      // FIXME: What is the expectation here if this is null?
      // Continue and call the field resolver or not?
      if (node[fieldName] == null) return node

      const { resolve, type } = tc.getFieldConfig(fieldName)

      if (typeof resolve === `function`) {
        node[fieldName] = await resolve(
          node,
          {},
          {},
          { fieldName, parentType: ``, returnType: type }
        )
      }

      // `dropQueryOperators` sets value to `true` for leaf values.
      const isLeaf = filterValue === true
      const value = node[fieldName]

      if (!isLeaf && value != null) {
        const fieldTC = tc.getFieldTC(fieldName)
        node[fieldName] = await resolveValue(value, filterValue, fieldTC)
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
  if (isProductionBuild) {
    cacheKey = JSON.stringify({ type, count: nodes.length, filterFields })
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey)
    }
  }

  const tc = schemaComposer.getTC(type)

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

      const queryNode = prepareForQuery(node, filterFields, tc)

      nodeCache.set(cacheKey, queryNode)
      trackObjects(await queryNode)
      return queryNode
    })
  )

  if (isProductionBuild) {
    cache.set(cacheKey, queryNodes)
  }

  return queryNodes
}

module.exports = getNodesForQuery
