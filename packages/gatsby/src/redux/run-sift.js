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
 * @param {Array<string>} chain Note: `$eq` is assumed to be the leaf prop here
 * @param {boolean | number | string} targetValue chain.a.b.$eq === targetValue
 * @param {Array<string>} nodeTypeNames
 * @param {Map<string, Map<string | number | boolean, Node>>} typedKeyValueIndexes
 * @returns {Array<Node> | undefined}
 */
const runFlatFilterWithoutSift = (
  chain,
  targetValue,
  nodeTypeNames,
  typedKeyValueIndexes
) => {
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
    return undefined
  }

  // In all other cases this must be a non-empty Set because the indexing
  // mechanism does not create a Set unless there's a Node for it
  return [...nodesByKeyValue]
}

/**
 * Filters and sorts a list of nodes using mongodb-like syntax.
 *
 * @param args raw graphql query filter/sort as an object
 * @property {boolean | number | string} args.type gqlType. See build-node-types
 * @property {boolean} args.firstOnly true if you want to return only the first
 *   result found. This will return a collection of size 1. Not a single element
 * @property {{filter?: Object, sort?: Object} | undefined} args.queryArgs
 * @property {undefined | Map<string, Map<string | number | boolean, Node>>} args.typedKeyValueIndexes
 *   May be undefined. A cache of indexes where you can look up Nodes grouped
 *   by a key: `types.join(',')+'/'+filterPath.join('+')`, which yields a Map
 *   which holds a Set of Nodes for the value that the filter is trying to eq
 *   against. If the property is `id` then there is no Set, it's just the Node.
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
  } = args

  let result = applyFilters(
    filter,
    firstOnly,
    nodeTypeNames,
    typedKeyValueIndexes,
    resolvedFields
  )

  return sortNodes(result, sort, resolvedFields)
}

exports.runSift = runFilterAndSort

/**
 * Applies filter. First through a simple approach, which is much faster than
 * running sift, but not as versatile and correct. If no nodes were found then
 * it falls back to filtering through sift.
 *
 * @param {Object | undefined} filterFields
 * @param {boolean} firstOnly
 * @param {Array<string>} nodeTypeNames
 * @param {undefined | Map<string, Map<string | number | boolean, Node>>} typedKeyValueIndexes
 * @param resolvedFields
 * @returns {Array<Node> | undefined} Collection of results. Collection will be
 *   limited to 1 if `firstOnly` is true
 */
const applyFilters = (
  filterFields,
  firstOnly,
  nodeTypeNames,
  typedKeyValueIndexes,
  resolvedFields
) => {
  const filters = filterFields
    ? prefixResolvedFields(
        createDbQueriesFromObject(prepareQueryArgs(filterFields)),
        resolvedFields
      )
    : []

  const result = filterWithoutSift(filters, nodeTypeNames, typedKeyValueIndexes)
  if (result) {
    if (firstOnly) {
      return result.slice(0, 1)
    }
    return result
  }

  return filterWithSift(filters, firstOnly, nodeTypeNames, resolvedFields)
}

/**
 * Check if the filter is "flat" (single leaf) and an "$eq". If so, uses custom
 * indexes based on filter and types and returns any result it finds.
 * If conditions are not met or no nodes are found, returns undefined.
 *
 * @param {Object} filter Resolved. (Should be checked by caller to exist)
 * @param {Array<string>} nodeTypeNames
 * @param {Map<string, Map<string | number | boolean, Node>>} typedKeyValueIndexes
 * @returns {Array|undefined} Collection of results
 */
const filterWithoutSift = (filters, nodeTypeNames, typedKeyValueIndexes) => {
  // This can also be `$ne`, `$in` or any other grapqhl comparison op
  if (
    !typedKeyValueIndexes ||
    filters.length !== 1 ||
    filters[0].type === `elemMatch` ||
    filters[0].query.comparator !== `$eq`
  ) {
    return undefined
  }

  const filter = filters[0]

  return runFlatFilterWithoutSift(
    filter.path,
    filter.query.value,
    nodeTypeNames,
    typedKeyValueIndexes
  )
}

// Not a public API
exports.filterWithoutSift = filterWithoutSift

/**
 * Use sift to apply filters
 *
 * @param {Array<Object>} filter Resolved
 * @param {boolean} firstOnly
 * @param {Array<string>} nodeTypeNames
 * @param resolvedFields
 * @returns {Array<Node> | undefined | null} Collection of results. Collection
 *   will be limited to 1 if `firstOnly` is true
 */
const filterWithSift = (filter, firstOnly, nodeTypeNames, resolvedFields) => {
  const nodes = [].concat(
    ...nodeTypeNames.map(typeName => addResolvedNodes(typeName))
  )

  return _runSiftOnNodes(
    nodes,
    filter.map(f => dbQueryToSiftQuery(f)),
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
 * @param {Array<Node>} nodes Should be all nodes of given type(s)
 * @param args Legacy api arg, see _runSiftOnNodes
 * @param {?function(id: string): Node} getNode
 * @returns {Array<Node> | undefined | null} Collection of results. Collection
 *   will be limited to 1 if `firstOnly` is true
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
 * @param {Array<Node>} nodes Should be all nodes of given type(s)
 * @param {Array<Object>} filter Resolved
 * @param {boolean} firstOnly
 * @param {Array<string>} nodeTypeNames
 * @param resolvedFields
 * @param {function(id: string): Node} getNode Note: this is different for loki
 * @returns {Array<Node> | undefined | null} Collection of results. Collection
 *   will be limited to 1 if `firstOnly` is true
 */
const _runSiftOnNodes = (
  nodes,
  filter,
  firstOnly,
  nodeTypeNames,
  resolvedFields,
  getNode
) => {
  // If the the query for single node only has a filter for an "id"
  // using "eq" operator, then we'll just grab that ID and return it.
  if (isEqId(filter)) {
    const node = getNode(filter[0].id.$eq)

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
    return handleFirst(filter, nodes)
  } else {
    return handleMany(filter, nodes)
  }
}

/**
 * Given a list of filtered nodes and sorting parameters, sort the nodes
 *
 * @param {Array<Node> | undefined | null} nodes Pre-filtered list of nodes
 * @param {Object | undefined} sort Sorting arguments
 * @param resolvedFields
 * @returns {Array<Node> | undefined | null} Same as input, except sorted
 */
const sortNodes = (nodes, sort, resolvedFields) => {
  if (!sort || nodes?.length <= 1) {
    return nodes
  }

  // create functions that return the item to compare on
  const dottedFields = objectToDottedField(resolvedFields)
  const dottedFieldKeys = Object.keys(dottedFields)
  const sortFields = sort.fields
    .map(field => {
      if (
        dottedFields[field] ||
        dottedFieldKeys.some(key => field.startsWith(key))
      ) {
        return `__gatsby_resolved.${field}`
      } else {
        return field
      }
    })
    .map(field => v => getValueAt(v, field))
  const sortOrder = sort.order.map(order => order.toLowerCase())

  return _.orderBy(nodes, sortFields, sortOrder)
}
