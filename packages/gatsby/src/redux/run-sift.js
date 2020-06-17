// @flow

const { prepareRegex } = require(`../utils/prepare-regex`)
const { makeRe } = require(`micromatch`)
import { getValueAt } from "../utils/get-value-at"
import _ from "lodash"
const {
  objectToDottedField,
  createDbQueriesFromObject,
  prefixResolvedFields,
} = require(`../db/common/query`)
const {
  ensureEmptyFilterCache,
  ensureIndexByQuery,
  ensureIndexByElemMatch,
  getNodesFromCacheByValue,
  intersectNodesByCounter,
} = require(`./nodes`)

/**
 * Creates a key for one filterCache inside FiltersCache
 *
 * @param {Array<string>} typeNames
 * @param {DbQuery | null} filter If null the key will have empty path/op parts
 * @returns {FilterCacheKey} (a string: `types.join()/path.join()/operator` )
 */
function createFilterCacheKey(typeNames, filter) {
  // Note: while `elemMatch` is a special case, in the key it's just `elemMatch`
  // (This function is future proof for elemMatch support, won't receive it yet)
  let f = filter
  let comparator = ``
  let paths /*: Array<string>*/ = []
  while (f) {
    paths.push(...f.path)
    if (f.type === `elemMatch`) {
      let q /*: IDbQueryElemMatch*/ = f
      f = q.nestedQuery
      // Make distinction between filtering `a.elemMatch.b.eq` and `a.b.eq`
      // In practice this is unlikely to be an issue, but it might
      paths.push(`elemMatch`)
    } else {
      let q /*: IDbQueryQuery*/ = f
      comparator = q.query.comparator
      break
    }
  }

  // Note: the separators (`,` and `/`) are arbitrary but must be different
  return typeNames.join(`,`) + `/` + paths.join(`,`) + `/` + comparator
}

function prepareQueryArgs(filterFields = {}) {
  const filters = {}
  Object.keys(filterFields).forEach(key => {
    const value = filterFields[key]
    if (_.isPlainObject(value)) {
      filters[key === `elemMatch` ? `$elemMatch` : key] = prepareQueryArgs(
        value
      )
    } else {
      switch (key) {
        case `regex`:
          filters[`$regex`] = prepareRegex(value)
          break
        case `glob`:
          filters[`$regex`] = makeRe(value)
          break
        default:
          filters[`$${key}`] = value
      }
    }
  })
  return filters
}

/**
 * Given the path of a set of filters, return the sets of nodes that pass the
 * filter.
 * Only nodes of given node types will be considered
 * A fast index is created if one doesn't exist yet so cold call is slower.
 *
 * @param {Array<DbQuery>} filters Resolved. (Should be checked by caller to exist)
 * @param {Array<string>} nodeTypeNames
 * @param {FiltersCache} filtersCache
 * @returns {Array<IGatsbyNode> | null}
 */
function applyFastFilters(filters, nodeTypeNames, filtersCache) {
  if (!filtersCache) {
    // If no filter cache is passed on, explicitly don't use one
    return null
  }

  const nodesPerValueArrs /*: Array<Array<IGatsbyNode>> */ = getBucketsForFilters(
    filters,
    nodeTypeNames,
    filtersCache
  )

  if (!nodesPerValueArrs) {
    return null
  }

  if (nodesPerValueArrs.length === 0) {
    return []
  }

  // Put smallest last (we'll pop it)
  nodesPerValueArrs.sort(
    (a /*: Array<IGatsbyNode> */, b /*: Array<IGatsbyNode> */) =>
      b.length - a.length
  )

  // All elements of nodesPerValueArrs should be sorted by counter and deduped
  // So if there's only one bucket in this list the next loop is skipped

  while (nodesPerValueArrs.length > 1) {
    nodesPerValueArrs.push(
      intersectNodesByCounter(nodesPerValueArrs.pop(), nodesPerValueArrs.pop())
    )
  }

  const result = nodesPerValueArrs[0]

  if (result.length === 0) {
    // Intersection came up empty. Not one node appeared in every bucket.
    return null
  }

  return result
}

/**
 * @param {Array<DbQuery>} filters
 * @param {Array<string>} nodeTypeNames
 * @param {FiltersCache} filtersCache
 * @returns {Array<Array<IGatsbyNode>> | undefined} Undefined means at least one
 *   cache was not found
 */
function getBucketsForFilters(filters, nodeTypeNames, filtersCache) {
  const nodesPerValueArrs /*: Array<Array<IGatsbyNode>>*/ = []

  // Fail fast while trying to create and get the value-cache for each path
  let every = filters.every((filter /*: DbQuery*/) => {
    let filterCacheKey = createFilterCacheKey(nodeTypeNames, filter)
    if (filter.type === `query`) {
      // (Let TS warn us if a new query type gets added)
      const q /*: IDbQueryQuery */ = filter
      return getBucketsForQueryFilter(
        filterCacheKey,
        q,
        nodeTypeNames,
        filtersCache,
        nodesPerValueArrs
      )
    } else {
      // (Let TS warn us if a new query type gets added)
      const q /*: IDbQueryElemMatch*/ = filter
      return collectBucketForElemMatch(
        filterCacheKey,
        q,
        nodeTypeNames,
        filtersCache,
        nodesPerValueArrs
      )
    }
  })

  if (every) {
    return nodesPerValueArrs
  }

  // "failed at least one"
  return undefined
}

/**
 * Fetch all buckets for given query filter. That means it's not elemMatch.
 *
 * @param {FilterCacheKey} filterCacheKey
 * @param {IDbQueryQuery} filter
 * @param {Array<string>} nodeTypeNames
 * @param {FiltersCache} filtersCache
 * @param {Array<Array<IGatsbyNode>>} nodesPerValueArrs
 * @returns {boolean} false means no nodes matched
 */
function getBucketsForQueryFilter(
  filterCacheKey,
  filter,
  nodeTypeNames,
  filtersCache,
  nodesPerValueArrs
) {
  let {
    path: filterPath,
    query: { comparator /*: as FilterOp*/, value: filterValue },
  } = filter

  if (!filtersCache.has(filterCacheKey)) {
    ensureIndexByQuery(
      comparator,
      filterCacheKey,
      filterPath,
      nodeTypeNames,
      filtersCache
    )
  }

  const nodesPerValue /*: Array<IGatsbyNode> | undefined */ = getNodesFromCacheByValue(
    filterCacheKey,
    filterValue,
    filtersCache,
    false
  )

  if (!nodesPerValue) {
    return false
  }

  // In all other cases this must be a non-empty arr because the indexing
  // mechanism does not create an array unless there's a IGatsbyNode for it
  nodesPerValueArrs.push(nodesPerValue)

  return true
}

/**
 * @param {FilterCacheKey} filterCacheKey
 * @param {IDbQueryElemMatch} filter
 * @param {Array<string>} nodeTypeNames
 * @param {FiltersCache} filtersCache
 * @param {Array<Array<IGatsbyNode>>} nodesPerValueArrs Matching node arrs are put in this array
 */
function collectBucketForElemMatch(
  filterCacheKey,
  filter,
  nodeTypeNames,
  filtersCache,
  nodesPerValueArrs
) {
  // Get comparator and target value for this elemMatch
  let comparator = ``
  let targetValue = null
  let f /*: DbQuery*/ = filter
  while (f) {
    if (f.type === `elemMatch`) {
      const q /*: IDbQueryElemMatch */ = f
      f = q.nestedQuery
    } else {
      const q /*: IDbQueryQuery */ = f
      comparator = q.query.comparator
      targetValue = q.query.value
      break
    }
  }

  if (!filtersCache.has(filterCacheKey)) {
    ensureIndexByElemMatch(
      comparator,
      filterCacheKey,
      filter,
      nodeTypeNames,
      filtersCache
    )
  }

  const nodesByValue /*: Array<IGatsbyNode> | undefined*/ = getNodesFromCacheByValue(
    filterCacheKey,
    targetValue,
    filtersCache,
    true
  )

  if (!nodesByValue) {
    return false
  }

  // In all other cases this must be a non-empty arr because the indexing
  // mechanism does not create an array unless there's a IGatsbyNode for it
  nodesPerValueArrs.push(nodesByValue)

  return true
}

/**
 * Filters and sorts a list of nodes using mongodb-like syntax.
 *
 * @param args raw graphql query filter/sort as an object
 * @property {boolean} args.firstOnly true if you want to return only the first
 *   result found. This will return a collection of size 1. Not a single element
 * @property {{filter?: Object, sort?: Object} | undefined} args.queryArgs
 * @property {FiltersCache} args.filtersCache A cache of indexes where you can
 *   look up Nodes grouped by a FilterCacheKey, which yields a Map which holds
 *   an arr of Nodes for the value that the filter is trying to query against.
 *   This object lives in query/query-runner.js and is passed down runQuery.
 * @returns Collection of results. Collection will be limited to 1
 *   if `firstOnly` is true
 */
function runFastFiltersAndSort(args: Object) {
  const {
    queryArgs: { filter, sort } = { filter: {}, sort: {} },
    resolvedFields = {},
    firstOnly = false,
    nodeTypeNames,
    filtersCache,
    stats,
  } = args

  const result = convertAndApplyFastFilters(
    filter,
    firstOnly,
    nodeTypeNames,
    filtersCache,
    resolvedFields,
    stats
  )

  return sortNodes(result, sort, resolvedFields, stats)
}

/**
 * @param {Array<DbQuery> | undefined} filterFields
 * @param {boolean} firstOnly
 * @param {Array<string>} nodeTypeNames
 * @param {FiltersCache} filtersCache
 * @param resolvedFields
 * @returns {Array<IGatsbyNode> | null} Collection of results. Collection
 *   will be limited to 1 if `firstOnly` is true
 */
function convertAndApplyFastFilters(
  filterFields,
  firstOnly,
  nodeTypeNames,
  filtersCache,
  resolvedFields,
  stats
) {
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

  if (filters.length === 0) {
    let filterCacheKey = createFilterCacheKey(nodeTypeNames, null)
    if (!filtersCache.has(filterCacheKey)) {
      ensureEmptyFilterCache(filterCacheKey, nodeTypeNames, filtersCache)
    }

    const cache = filtersCache.get(filterCacheKey).meta.orderedByCounter

    if (firstOnly || cache.length) {
      return cache.slice(0)
    }
    return null
  }

  const result /*: Array<IGatsbyNode> | null */ = applyFastFilters(
    filters,
    nodeTypeNames,
    filtersCache
  )

  if (result) {
    if (stats) {
      stats.totalIndexHits++
    }
    if (firstOnly) {
      return result.slice(0, 1)
    }
    return result
  }

  if (stats) {
    // to mean, "empty results"
    stats.totalSiftHits++
  }

  if (firstOnly) {
    return []
  }
  return null
}

function filterToStats(
  filter /*: DbQuery*/,
  filterPath = [],
  comparatorPath = []
) {
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
 * Given a list of filtered nodes and sorting parameters, sort the nodes
 *
 * @param {Array<IGatsbyNode> | null} nodes Pre-filtered list of nodes
 * @param {Object | undefined} sort Sorting arguments
 * @param resolvedFields
 * @returns {Array<IGatsbyNode> | undefined | null} Same as input, except sorted
 */
function sortNodes(nodes, sort, resolvedFields, stats) {
  // `undefined <= 1` and `undefined > 1` are both false so invert the result...
  if (!sort || !(nodes?.length > 1)) {
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

module.exports = {
  // Not a public API
  applyFastFilters,
  // Public API
  runFastFiltersAndSort,
}
