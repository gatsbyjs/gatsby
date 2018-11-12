// TODO:
// Nodes in the store don't have fields which are
// - added in `setFieldsOnGraphQLNodeType`
// - added in `@link` directive.
// Therefore we need to resolve those fields so they are
// available for querying.
// FIXME: Can't we do this just *once* during bootstrap,
// i.e. resolve all fields and save them to the store?
// And with LokiJS, can we do proper foreign keys and views?

// FIXME: rename gqField, gqFields, gqType

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
  // FIXME: Make this a .map() and resolve with Promise.all.
  // .reduce() works sequentially: must resolve `acc` before the next iteration
  // Promise.all(
  //   Object.entries(filter)
  //     .map(async ([filterName, filterValue]) => {
  //       // ...
  //       return result && [filterName, result]
  //     })
  //     .filter(Boolean)
  // ).then(fields =>
  //   fields.reduce((acc, [key, value]) => (acc[key] = value) && acc, node)
  // )

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
            // returnType, // TODO:
          }
        )
      }

      // TODO: Is array of array handled correctly?
      // TODO: isObject(filterValue)
      if (typeof filterValue === `object` && node[filterName] != null) {
        const gqFields = gqType.getFields()
        if (Array.isArray(node[filterName])) {
          node[filterName] = await Promise.all(
            node[filterName].map(item =>
              prepareForQuery(item, filterValue, gqFields)
            )
          )
          // .filter(n => n != null) // TODO:
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

  // Should we do it the other way around, i.e. queryNodes = filter.reduce?
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
        // FIXME: Shallow copy the node, to avoid mutating the nodes in the store.
        // Possible alternative: start reducing not from node, but from {}, and copy fields
        // when no resolver.
        { ...node },
        filterFields,
        gqFields
      )

      nodeCache.set(cacheKey, queryNode)
      trackObjects(await queryNode)
      return queryNode
    })
  )

  cache.set(cacheKey, queryNodes)
  return queryNodes
}

module.exports = getNodesForQuery
