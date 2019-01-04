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

// TODO: Filter sparse arrays?
const resolveValue = (value, filterValue, type) => {
  // TODO: Maybe use const { getNullableType } = require(`graphql`)
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

      const { type, args, resolve } = fields[fieldName]

      if (typeof resolve === `function`) {
        const defaultValues = args.reduce((acc, { name, defaultValue }) => {
          acc[name] = defaultValue
          return acc
        }, {})
        node[fieldName] = await resolve(
          node,
          defaultValues,
          {},
          // NOTE: fieldNodes is needed for `graphql-tools` schema stitching
          // to work (which we don't use currently)
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
  // Alternatively, call @link resolvers manually.
  const { schema } = store.getState()

  // Just an experiment. This works as well -- but does not cache resolved nodes.
  // const { execute, parse } = require(`graphql`)
  // const queryField = `all${type}`
  // const query = `{ ${queryField} { ${Object.keys(filterFields).join(`, `)} } }`
  // const { data, errors } = await execute({ schema, document: parse(query) })
  // const queryNodes = data && data[queryField]

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
