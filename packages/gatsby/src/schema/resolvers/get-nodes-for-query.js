const { schemaComposer } = require(`graphql-compose`)

// const { store } = require(`../../redux`)
const { getNodesByType } = require(`../db`)
const { dropQueryOperators } = require(`../query`)
const { isProductionBuild } = require(`../utils`)
const { trackObjects } = require(`../utils/node-tracking`)

const cache = new Map()
const nodeCache = new Map()

// const getNullableType = type =>
//   type instanceof GraphQLNonNull ? type.ofType : type

// const getSingularType = type => {
//   let t = type
//   while (t instanceof GraphQLList) {
//     t = t.ofType
//   }
//   return t
// }

const dropTypeModifiers = type => {
  let t = type
  while (t.ofType) {
    t = t.ofType
  }
  return t
}

const prepareForQuery = (node, filter, gqFields) => {
  // FIXME: Make this a .map() and resolve with Promise.all,
  // since .reduce() must sequentially resolve `acc` before the next iteration
  const queryNode = Object.entries(filter).reduce(
    async (acc, [filterName, filterValue]) => {
      const node = await acc
      const gqField = gqFields[filterName]
      const gqType = dropTypeModifiers(gqField.type) // TODO: should be two different steps for NonNull and List, so we can have the correct returnType

      if (typeof gqField.resolve === `function`) {
        node[filterName] = await gqField.resolve(
          node,
          {},
          {},
          {
            fieldName: gqField.name, // filterName,
            parentType: ``, // TODO: Not important, but maybe return correct type
            // returnType,
          }
        )
      }

      if (typeof filterValue === `object` && node[filterName] != null) {
        const gqFields = gqType.getFields()
        if (Array.isArray(node[filterName])) {
          node[filterName] = await Promise.all(
            node[filterName].map(item =>
              prepareForQuery(item, filterValue, gqFields)
            )
          )
          // .filter(n => n != null)
        } else {
          node[filterName] = await prepareForQuery(
            node[filterName],
            filterValue,
            gqFields
          )
        }
      }

      return node
    },
    Promise.resolve(node)
  )
  return queryNode
}

const getNodesForQuery = async (type, filter) => {
  const nodes = await getNodesByType(type)

  if (!filter) return nodes

  const filterFields = dropQueryOperators(filter)
  const cacheKey = JSON.stringify({ type, count: nodes.length, filterFields })
  if (isProductionBuild && cache.has(cacheKey)) {
    return cache.get(cacheKey)
  }

  // const { getType } = require(`../../redux`).store.getState().schema
  // const gqFields = getType(type).getFields()
  const gqFields = schemaComposer
    .getTC(type)
    .getType()
    .getFields()

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

      const queryNode = prepareForQuery({ ...node }, filterFields, gqFields)

      nodeCache.set(cacheKey, queryNode)
      trackObjects(await queryNode)
      return queryNode
    })
  )

  cache.set(cacheKey, queryNodes)
  return queryNodes
}

module.exports = getNodesForQuery
