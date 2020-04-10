// @flow
const { default: sift } = require(`sift`)
const _ = require(`lodash`)
const prepareRegex = require(`../utils/prepare-regex`)
const { makeRe } = require(`micromatch`)
const { getValueAt } = require(`../utils/get-value-at`)
const {
  toDottedFields,
  objectToDottedField,
  liftResolvedFields,
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
  Object.keys(filters).reduce(
    (acc, key) => acc.push({ [key]: filters[key] }) && acc,
    []
  )

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
 * Given an object, assert that it has exactly one leaf property and that this
 * leaf is a number, string, or boolean. Additionally confirms that the path
 * does not contain the special cased `elemMatch` name.
 * Returns undefined if not a flat path, if it contains `elemMatch`, or if the
 * leaf value was not a bool, number, or string.
 * If array, it contains the property path followed by the leaf value.
 * Returns `undefined` if any condition is not met
 *
 * Example: `{a: {b: {c: "x"}}}` is flat with a chain of `['a', 'b', 'c', 'x']`
 * Example: `{a: {b: "x", c: "y"}}` is not flat because x and y are 2 leafs
 *
 * @param {Object} obj
 * @returns {Array<string | number | boolean>|undefined}
 */
const getFlatPropertyChain = obj => {
  if (!obj) {
    return undefined
  }

  let chain = []
  let props = Object.getOwnPropertyNames(obj)
  let next = obj
  while (props.length === 1) {
    const prop = props[0]
    if (prop === `elemMatch`) {
      // TODO: Support handling this special case without sift as well
      return undefined
    }
    chain.push(prop)
    next = next[prop]
    if (
      typeof next === `string` ||
      typeof next === `number` ||
      typeof next === `boolean`
    ) {
      chain.push(next)
      return chain
    }
    if (!next) {
      return undefined
    }
    props = Object.getOwnPropertyNames(next)
  }

  // This means at least one object in the chain had more than one property
  return undefined
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
 * @param {Array<string>} chain Note: `eq` is assumed to be the leaf prop here
 * @param {boolean | number | string} targetValue chain.chain.eq === targetValue
 * @param {Array<string>} nodeTypeNames
 * @param {undefined | Map<string, Map<string | number | boolean, Node>>} typedKeyValueIndexes
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

  if (chain.join(`,`) === `id`) {
    // The `id` key is not indexed in Sets (because why) so don't spread it
    return [nodesByKeyValue]
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
 * @param {Object | undefined} filter
 * @param {boolean} firstOnly
 * @param {Array<string>} nodeTypeNames
 * @param {undefined | Map<string, Map<string | number | boolean, Node>>} typedKeyValueIndexes
 * @param resolvedFields
 * @returns {Array<Node> | undefined} Collection of results. Collection will be
 *   limited to 1 if `firstOnly` is true
 */
const applyFilters = (
  filter,
  firstOnly,
  nodeTypeNames,
  typedKeyValueIndexes,
  resolvedFields
) => {
  let result
  if (typedKeyValueIndexes) {
    result = filterWithoutSift(filter, nodeTypeNames, typedKeyValueIndexes)
    if (result) {
      if (firstOnly) {
        return result.slice(0, 1)
      }
      return result
    }
  }

  return filterWithSift(filter, firstOnly, nodeTypeNames, resolvedFields)
}

/**
 * Check if the filter is "flat" (single leaf) and an "eq". If so, uses custom
 * indexes based on filter and types and returns any result it finds.
 * If conditions are not met or no nodes are found, returns undefined.
 *
 * @param {Object | undefined} filter
 * @param {Array<string>} nodeTypeNames
 * @param {undefined | Map<string, Map<string | number | boolean, Node>>} typedKeyValueIndexes
 * @returns {Array|undefined} Collection of results
 */
const filterWithoutSift = (filter, nodeTypeNames, typedKeyValueIndexes) => {
  if (!filter) {
    return undefined
  }

  // Filter can be any struct of {a: {b: {c: {eq: "x"}}}} and we want to confirm
  // there is exactly one leaf in this structure and that this leaf is `eq`. The
  // actual names are irrelevant, they are a chain of props on a Node.

  let chainWithNeedle = getFlatPropertyChain(filter)
  if (!chainWithNeedle) {
    return undefined
  }

  // `chainWithNeedle` should now be like:
  //   `filter = {this: {is: {the: {chain: {eq: needle}}}}}`
  //  ->
  //   `['this', 'is', 'the', 'chain', 'eq', needle]`
  let targetValue = chainWithNeedle.pop()
  let lastPath = chainWithNeedle.pop()

  // This can also be `ne`, `in` or any other grapqhl comparison op
  if (lastPath !== `eq`) {
    return undefined
  }

  return runFlatFilterWithoutSift(
    chainWithNeedle,
    targetValue,
    nodeTypeNames,
    typedKeyValueIndexes
  )
}

/**
 * Use sift to apply filters
 *
 * @param {Object | undefined} filter
 * @param {boolean} firstOnly
 * @param {Array<string>} nodeTypeNames
 * @param resolvedFields
 * @returns {Array<Node> | undefined | null} Collection of results. Collection
 *   will be limited to 1 if `firstOnly` is true
 */
const filterWithSift = (filter, firstOnly, nodeTypeNames, resolvedFields) => {
  let nodes = []

  nodeTypeNames.forEach(typeName => addResolvedNodes(typeName, nodes))

  return _runSiftOnNodes(
    nodes,
    filter,
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

  return _runSiftOnNodes(
    nodes,
    filter,
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
 * @param {Object | undefined} filter
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
  let siftFilter = getFilters(
    liftResolvedFields(toDottedFields(prepareQueryArgs(filter)), resolvedFields)
  )

  // If the the query for single node only has a filter for an "id"
  // using "eq" operator, then we'll just grab that ID and return it.
  if (isEqId(siftFilter)) {
    const node = getNode(siftFilter[0].id.$eq)

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
    return handleFirst(siftFilter, nodes)
  } else {
    return handleMany(siftFilter, nodes)
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
