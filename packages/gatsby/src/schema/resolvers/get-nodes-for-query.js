/**
 * Nodes in the store don't have fields which are
 * - added in `setFieldsOnGraphQLNodeType`
 * - added in `@link` directive.
 * Therefore we need to resolve those fields so they are
 * available for querying.
 */

const { schemaComposer } = require(`graphql-compose`)

// const { store } = require(`../../redux`)
const { getNodesByType } = require(`../db`)
const { dropQueryOperators } = require(`../query`)
const { isProductionBuild } = require(`../utils`)
const { trackObjects } = require(`../utils/node-tracking`)

const cache = new Map()
const nodeCache = new Map()

const getLinkResolver = (astNode, type) => {
  const linkDirective = astNode.directives.find(
    directive => directive.name.value === `link`
  )
  if (linkDirective) {
    const { GraphQLList } = require(`graphql`)
    const { findOne, findMany, link } = require(`./resolvers`)

    const by = linkDirective.arguments.find(
      argument => argument.name.value === `by`
    ).value.value

    return link({ by })(
      type instanceof GraphQLList
        ? findMany(type.ofType.name)
        : findOne(type.name)
    )
  }
  return null
}

// TODO: Filter sparse arrays?
const resolveValue = (value, filterValue, fieldTC) =>
  Array.isArray(value)
    ? Promise.all(value.map(item => resolveValue(item, filterValue, fieldTC)))
    : prepareForQuery(value, filterValue, fieldTC)

const prepareForQuery = (node, filter, tc) => {
  const queryNode = Object.entries(filter).reduce(
    async (acc, [fieldName, filterValue]) => {
      const node = await acc
      // FIXME: What is the expectation here if this is null?
      // Continue and call the field resolver or not?
      if (node[fieldName] == null) return node

      const { resolve, type, astNode } = tc.getFieldConfig(fieldName)

      // FIXME: This is just to test if manually calling the link directive
      // resolver would work (it does). Instead we should use the executable
      // schema where the link resolvers are already added.
      const resolver = (astNode && getLinkResolver(astNode, type)) || resolve

      if (typeof resolver === `function`) {
        node[fieldName] = await resolver(
          node,
          {},
          {},
          { fieldName, parentType: {}, returnType: type }
        )
      }

      // `dropQueryOperators` sets value to `true` for leaf values.
      // Maybe be more explicit: `const isLeaf = !isObject(filterValue)`
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

  // FIXME: Use schema from store (includes resolvers added by @link directive)
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
