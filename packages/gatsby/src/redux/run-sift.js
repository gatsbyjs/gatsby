// @flow
const { default: sift } = require(`sift`)
const { prepareRegex } = require(`../utils/prepare-regex`)
const { makeRe } = require(`micromatch`)
import { getValueAt } from "../utils/get-value-at"
import _ from "lodash"
const {
  toDottedFields,
  objectToDottedField,
  liftResolvedFields,
  createDbQueriesFromObject,
  prefixResolvedFields,
  dbQueryToSiftQuery,
} = require(`../db/common/query`)
const {
  ensureIndexByTypedChain,
  getNodesByTypedChain,
  addResolvedNodes,
  getNode: siftGetNode,
} = require(`./nodes`)

/////////////////////////////////////////////////////////////////////
// Parse filter
/////////////////////////////////////////////////////////////////////

const prepareQueryArgs = (filterFields = {}) =>
  Object.keys(filterFields).reduce((acc, key) => {
    const value = filterFields[key]
    if (_.isPlainObject(value)) {
      acc[key === `elemMatch` ? `$elemMatch` : key] = prepareQueryArgs(value)
    } else {
      switch (key) {
        case `regex`:
          acc[`$regex`] = prepareRegex(value)
          break
        case `glob`:
          acc[`$regex`] = makeRe(value)
          break
        default:
          acc[`$${key}`] = value
      }
    }
    return acc
  }, {})

const getFilters = filters =>
  Object.keys(filters).map(key => {
    return { [key]: filters[key] }
  })

/////////////////////////////////////////////////////////////////////
// Run Sift
/////////////////////////////////////////////////////////////////////

function isEqId(siftArgs) {
  // The `id` of each node is invariably unique. So if a query is doing id $eq(string) it can find only one node tops
  return (
    siftArgs.length > 0 &&
    siftArgs[0].id &&
    Object.keys(siftArgs[0].id).length === 1 &&
    Object.keys(siftArgs[0].id)[0] === `$eq`
  )
}

function handleFirst(siftArgs, nodes) {
  if (nodes.length === 0) {
    return []
  }

  const index = _.isEmpty(siftArgs)
    ? 0
    : nodes.findIndex(
        sift({
          $and: siftArgs,
        })
      )

  if (index !== -1) {
    return [nodes[index]]
  } else {
    return []
  }
}

function handleMany(siftArgs, nodes) {
  let result = _.isEmpty(siftArgs)
    ? nodes
    : nodes.filter(
        sift({
          $and: siftArgs,
        })
      )

  return result?.length ? result : null
}

/**
 * Given the chain of a simple filter, return the set of nodes that pass the
 * filter. The chain should be a property chain leading to the property to
 * check, followed by the value to check against. Common example:
 *   `allThings(filter: { fields: { slug: { eq: $slug } } })`
 * Only nodes of given node types will be considered
 * A fast index is created if one doesn't exist yet so cold call is slower.
 * The empty result value is null if firstOnly is false, or else an empty array.
 *
 * @param {Array<DbQuery>} filters Resolved. (Should be checked by caller to exist)
 * @param {Array<string>} nodeTypeNames
 * @param {Map<string, Map<string | number | boolean, Set<IGatsbyNode>>>} typedKeyValueIndexes
 * @returns {Array<IGatsbyNode> | undefined}
 */
const runFlatFiltersWithoutSift = (
  filters,
  nodeTypeNames,
  typedKeyValueIndexes
) => {
  const caches = getBucketsForFilters(
    filters,
    nodeTypeNames,
    typedKeyValueIndexes
  )

  if (!caches) {
    // Let Sift take over as fallback
    return undefined
  }

  // Put smallest last (we'll pop it)
  caches.sort((a, b) => b.length - a.length)
  // Iterate on the set with the fewest elements and create the intersection
  const needles = caches.pop()
  // Take the intersection of the retrieved caches-by-value
  const result = []

  // This _can_ still be expensive but the set of nodes should be limited ...
  needles.forEach(node => {
    if (caches.every(cache => cache.has(node))) {
      // Every cache set contained this node so keep it
      result.push(node)
    }
  })

  // TODO: do we cache this result? I'm not sure how likely it is to be reused
  // Consider the case of {a: {eq: 5}, b: {eq: 10}}, do we cache the [5,10]
  // case for all value pairs? How likely is that to ever be reused?

  return result
}

/**
 * @param {Array<DbQuery>} filters
 * @param {Array<string>} nodeTypeNames
 * @param {Map<string, Map<string | number | boolean, Set<IGatsbyNode>>>} typedKeyValueIndexes
 * @returns {Array<Set<IGatsbyNode>> | undefined} Undefined means at least one
 *   cache was not found. Must fallback to sift.
 */
const getBucketsForFilters = (filters, nodeTypeNames, typedKeyValueIndexes) => {
  const caches /*: Array<Map<string|number|boolean, Set<IGatsbyNode>>>*/ = []

  // Fail fast while trying to create and get the value-cache for each path
  let every = filters.every((filter /*: DbQuery*/) => {
    let {
      path: chain,
      query: { value: targetValue },
    } = filter

    ensureIndexByTypedChain(chain, nodeTypeNames, typedKeyValueIndexes)

    const nodesByKeyValue = getNodesByTypedChain(
      chain,
      targetValue,
      nodeTypeNames,
      typedKeyValueIndexes
    )

    // If we couldn't find the needle then maybe sift can, for example if the
    // schema contained a proxy; `slug: String @proxy(from: "slugInternal")`
    // There are also cases (and tests) where id exists with a different type
    if (!nodesByKeyValue) {
      return false
    }

    // In all other cases this must be a non-empty Set because the indexing
    // mechanism does not create a Set unless there's a IGatsbyNode for it
    caches.push(nodesByKeyValue)

    return true
  })

  if (every) {
    return caches
  }

  // "failed at least one"
  return undefined
}

/**
 * Filters and sorts a list of nodes using mongodb-like syntax.
 *
 * @param args raw graphql query filter/sort as an object
 * @property {boolean | number | string} args.type gqlType. See build-node-types
 * @property {boolean} args.firstOnly true if you want to return only the first
 *   result found. This will return a collection of size 1. Not a single element
 * @property {{filter?: Object, sort?: Object} | undefined} args.queryArgs
 * @property {undefined | Map<string, Map<string | number | boolean, Set<IGatsbyNode>>>} args.typedKeyValueIndexes
 *   May be undefined. A cache of indexes where you can look up Nodes grouped
 *   by a key: `types.join(',')+'/'+filterPath.join('+')`, which yields a Map
 *   which holds a Set of Nodes for the value that the filter is trying to eq
 *   against. If the property is `id` then there is no Set, it's just the IGatsbyNode.
 *   This object lives in query/query-runner.js and is passed down runQuery
 * @returns Collection of results. Collection will be limited to 1
 *   if `firstOnly` is true
 */
const runFilterAndSort = (args: Object) => {
  const {
    queryArgs: { filter, sort } = { filter: {}, sort: {} },
    resolvedFields = {},
    firstOnly = false,
    nodeTypeNames,
    typedKeyValueIndexes,
    stats,
  } = args

  const result = applyFilters(
    filter,
    firstOnly,
    nodeTypeNames,
    typedKeyValueIndexes,
    resolvedFields,
    stats
  )

  return sortNodes(result, sort, resolvedFields, stats)
}

exports.runSift = runFilterAndSort

/**
 * Applies filter. First through a simple approach, which is much faster than
 * running sift, but not as versatile and correct. If no nodes were found then
 * it falls back to filtering through sift.
 *
 * @param {Array<DbQuery> | undefined} filterFields
 * @param {boolean} firstOnly
 * @param {Array<string>} nodeTypeNames
 * @param {undefined | Map<string, Map<string | number | boolean, Set<IGatsbyNode>>>} typedKeyValueIndexes
 * @param resolvedFields
 * @returns {Array<IGatsbyNode> | undefined} Collection of results. Collection
 *   will be limited to 1 if `firstOnly` is true
 */
const applyFilters = (
  filterFields,
  firstOnly,
  nodeTypeNames,
  typedKeyValueIndexes,
  resolvedFields,
  stats
) => {
  const filters /*: Array<DbQuery>*/ = filterFields
    ? prefixResolvedFields(
        createDbQueriesFromObject(prepareQueryArgs(filterFields)),
        resolvedFields
      )
    : []

  if (stats) {
    filters.forEach((filter /*: DbQuery*/) => {
      const filterStats = filterToStats(filter)
      const comparatorPath = filterStats.comparatorPath.join(`.`)
      stats.comparatorsUsed.set(
        comparatorPath,
        (stats.comparatorsUsed.get(comparatorPath) || 0) + 1
      )
      stats.uniqueFilterPaths.add(filterStats.filterPath.join(`.`))
    })
    if (filters.length > 1) {
      stats.totalNonSingleFilters++
    }
  }

  const result = filterWithoutSift(filters, nodeTypeNames, typedKeyValueIndexes)
  if (result) {
    if (stats) {
      stats.totalIndexHits++
    }
    if (firstOnly) {
      return result.slice(0, 1)
    }
    return result
  }

  return filterWithSift(filters, firstOnly, nodeTypeNames, resolvedFields)
}

const filterToStats = (
  filter /*: DbQuery*/,
  filterPath = [],
  comparatorPath = []
) => {
  if (filter.type === `elemMatch`) {
    return filterToStats(
      filter.nestedQuery,
      filterPath.concat(filter.path),
      comparatorPath.concat([`elemMatch`])
    )
  } else {
    return {
      filterPath: filterPath.concat(filter.path),
      comparatorPath: comparatorPath.concat(filter.query.comparator),
    }
  }
}

/**
 * Check if the filter is "flat" (single leaf) and an "$eq". If so, uses custom
 * indexes based on filter and types and returns any result it finds.
 * If conditions are not met or no nodes are found, returns undefined.
 *
 * @param {Array<DbQuery>} filters Resolved. (Should be checked by caller to exist)
 * @param {Array<string>} nodeTypeNames
 * @param {Map<string, Map<string | number | boolean, Set<IGatsbyNode>>>} typedKeyValueIndexes
 * @returns {Array|undefined} Collection of results
 */
const filterWithoutSift = (filters, nodeTypeNames, typedKeyValueIndexes) => {
  // This can also be `$ne`, `$in` or any other grapqhl comparison op
  if (
    !typedKeyValueIndexes ||
    filters.length === 0 || // TODO: we should special case this
    filters.some(
      filter => filter.type === `elemMatch` || filter.query.comparator !== `$eq`
    )
  ) {
    return undefined
  }

  return runFlatFiltersWithoutSift(filters, nodeTypeNames, typedKeyValueIndexes)
}

// Not a public API
exports.filterWithoutSift = filterWithoutSift

/**
 * Use sift to apply filters
 *
 * @param {Array<DbQuery>} filters Resolved
 * @param {boolean} firstOnly
 * @param {Array<string>} nodeTypeNames
 * @param resolvedFields
 * @returns {Array<IGatsbyNode> | undefined | null} Collection of results.
 *   Collection will be limited to 1 if `firstOnly` is true
 */
const filterWithSift = (filters, firstOnly, nodeTypeNames, resolvedFields) => {
  let nodes /*: IGatsbyNode[]*/ = []
  nodeTypeNames.forEach(typeName => addResolvedNodes(typeName, nodes))

  return _runSiftOnNodes(
    nodes,
    filters.map(f => dbQueryToSiftQuery(f)),
    firstOnly,
    nodeTypeNames,
    resolvedFields,
    siftGetNode
  )
}

/**
 * Given a list of filtered nodes and sorting parameters, sort the nodes
 * Note: this entry point is used by GATSBY_DB_NODES=loki
 *
 * @param {Array<IGatsbyNode>} nodes Should be all nodes of given type(s)
 * @param args Legacy api arg, see _runSiftOnNodes
 * @param {?function(id: string): IGatsbyNode | undefined} getNode
 * @returns {Array<IGatsbyNode> | undefined | null} Collection of results.
 *   Collection will be limited to 1 if `firstOnly` is true
 */
const runSiftOnNodes = (nodes, args, getNode = siftGetNode) => {
  const {
    queryArgs: { filter } = { filter: {} },
    firstOnly = false,
    resolvedFields = {},
    nodeTypeNames,
  } = args

  let siftFilter = getFilters(
    liftResolvedFields(toDottedFields(prepareQueryArgs(filter)), resolvedFields)
  )

  return _runSiftOnNodes(
    nodes,
    siftFilter,
    firstOnly,
    nodeTypeNames,
    resolvedFields,
    getNode
  )
}

exports.runSiftOnNodes = runSiftOnNodes

/**
 * Given a list of filtered nodes and sorting parameters, sort the nodes
 *
 * @param {Array<IGatsbyNode>} nodes Should be all nodes of given type(s)
 * @param {Array<DbQuery>} filters Resolved
 * @param {boolean} firstOnly
 * @param {Array<string>} nodeTypeNames
 * @param resolvedFields
 * @param {function(id: string): IGatsbyNode | undefined} getNode Note: this is
 *   different for loki
 * @returns {Array<IGatsbyNode> | undefined | null} Collection of results.
 *   Collection will be limited to 1 if `firstOnly` is true
 */
const _runSiftOnNodes = (
  nodes,
  filters,
  firstOnly,
  nodeTypeNames,
  resolvedFields,
  getNode
) => {
  // If the the query for single node only has a filter for an "id"
  // using "eq" operator, then we'll just grab that ID and return it.
  if (isEqId(filters)) {
    const node = getNode(filters[0].id.$eq)

    if (
      !node ||
      (node.internal && !nodeTypeNames.includes(node.internal.type))
    ) {
      if (firstOnly) {
        return []
      }
      return null
    }

    return [node]
  }

  if (firstOnly) {
    return handleFirst(filters, nodes)
  } else {
    return handleMany(filters, nodes)
  }
}

/**
 * Given a list of filtered nodes and sorting parameters, sort the nodes
 *
 * @param {Array<IGatsbyNode> | undefined | null} nodes Pre-filtered list of nodes
 * @param {Object | undefined} sort Sorting arguments
 * @param resolvedFields
 * @returns {Array<IGatsbyNode> | undefined | null} Same as input, except sorted
 */
const sortNodes = (nodes, sort, resolvedFields, stats) => {
  if (!sort || nodes?.length <= 1) {
    return nodes
  }

  // create functions that return the item to compare on
  const dottedFields = objectToDottedField(resolvedFields)
  const dottedFieldKeys = Object.keys(dottedFields)
  const sortFields = sort.fields.map(field => {
    if (
      dottedFields[field] ||
      dottedFieldKeys.some(key => field.startsWith(key))
    ) {
      return `__gatsby_resolved.${field}`
    } else {
      return field
    }
  })
  const sortFns = sortFields.map(field => v => getValueAt(v, field))
  const sortOrder = sort.order.map(order => order.toLowerCase())

  if (stats) {
    sortFields.forEach(sortField => {
      stats.uniqueSorts.add(sortField)
    })
  }

  return _.orderBy(nodes, sortFns, sortOrder)
}
