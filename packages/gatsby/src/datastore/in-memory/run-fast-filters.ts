import { IGatsbyNode } from "../../redux/types"
import { GatsbyGraphQLType } from "../../.."
import { prepareRegex } from "../../utils/prepare-regex"
import { makeRe } from "micromatch"
import { getValueAt } from "../../utils/get-value-at"
import _ from "lodash"
import {
  DbQuery,
  IDbQueryQuery,
  IDbQueryElemMatch,
  objectToDottedField,
  createDbQueriesFromObject,
  prefixResolvedFields,
} from "../common/query"
import {
  FilterOp,
  FilterCacheKey,
  FiltersCache,
  FilterValueNullable,
  ensureEmptyFilterCache,
  ensureIndexByQuery,
  ensureIndexByElemMatch,
  getNodesFromCacheByValue,
  intersectNodesByCounter,
  IFilterCache,
} from "./indexing"
import { IGraphQLRunnerStats } from "../../query/types"
import { IQueryResult } from "../types"

// The value is an object with arbitrary keys that are either filter values or,
// recursively, an object with the same struct. Ie. `{a: {a: {a: 2}}}`
interface IInputQuery {
  [key: string]: FilterValueNullable | IInputQuery
}
// Similar to IInputQuery except the comparator leaf nodes will have their
// key prefixed with `$` and their value, in some cases, normalized.
interface IPreparedQueryArg {
  [key: string]: FilterValueNullable | IPreparedQueryArg
}

interface IRunFilterArg {
  gqlType: GatsbyGraphQLType
  queryArgs: {
    filter: Array<IInputQuery> | undefined
    sort:
      | { fields: Array<string>; order: Array<boolean | "asc" | "desc"> }
      | undefined
    skip?: number
    limit?: number
  }
  resolvedFields: Record<string, any>
  nodeTypeNames: Array<string>
  filtersCache: FiltersCache
  stats: IGraphQLRunnerStats
}

/**
 * Creates a key for one filterCache inside FiltersCache
 */
function createFilterCacheKey(
  typeNames: Array<string>,
  filter: DbQuery | null
): FilterCacheKey {
  // Note: while `elemMatch` is a special case, in the key it's just `elemMatch`
  // (This function is future proof for elemMatch support, won't receive it yet)
  let filterStep = filter
  let comparator = ``
  const paths: Array<string> = []
  while (filterStep) {
    paths.push(...filterStep.path)
    if (filterStep.type === `elemMatch`) {
      const q: IDbQueryElemMatch = filterStep
      filterStep = q.nestedQuery
      // Make distinction between filtering `a.elemMatch.b.eq` and `a.b.eq`
      // In practice this is unlikely to be an issue, but it might
      paths.push(`elemMatch`)
    } else {
      const q: IDbQueryQuery = filterStep
      comparator = q.query.comparator
      break
    }
  }

  // Note: the separators (`,` and `/`) are arbitrary but must be different
  return typeNames.join(`,`) + `/` + paths.join(`,`) + `/` + comparator
}

function prepareQueryArgs(
  filterFields: Array<IInputQuery> | IInputQuery = {}
): IPreparedQueryArg {
  const filters = {}
  Object.keys(filterFields).forEach(key => {
    const value = filterFields[key]
    if (_.isPlainObject(value)) {
      filters[key === `elemMatch` ? `$elemMatch` : key] = prepareQueryArgs(
        value as IInputQuery
      )
    } else {
      switch (key) {
        case `regex`:
          if (typeof value !== `string`) {
            throw new Error(
              `The $regex comparator is expecting the regex as a string, not an actual regex or anything else`
            )
          }
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
 * Note: Not a public API. Exported for tests.
 */
export function applyFastFilters(
  filters: Array<DbQuery>,
  nodeTypeNames: Array<string>,
  filtersCache: FiltersCache
): Array<IGatsbyNode> | null {
  if (!filtersCache) {
    // If no filter cache is passed on, explicitly don't use one
    return null
  }

  const nodesPerValueArrs = getBucketsForFilters(
    filters,
    nodeTypeNames,
    filtersCache
  )

  if (!nodesPerValueArrs) {
    return null
  }

  if (nodesPerValueArrs.length === 0) {
    return []
  } else {
    // Put smallest last (we'll pop it)
    nodesPerValueArrs.sort((a, b) => b.length - a.length)

    // All elements of nodesPerValueArrs should be sorted by counter and deduped
    // So if there's only one bucket in this list the next loop is skipped

    while (nodesPerValueArrs.length > 1) {
      // TS limitation: cannot guard against .pop(), so we must double cast
      const a = (nodesPerValueArrs.pop() as unknown) as Array<IGatsbyNode>
      const b = (nodesPerValueArrs.pop() as unknown) as Array<IGatsbyNode>
      nodesPerValueArrs.push(intersectNodesByCounter(a, b))
    }

    const result = nodesPerValueArrs[0]

    if (result.length === 0) {
      // Intersection came up empty. Not one node appeared in every bucket.
      return null
    }

    return result
  }
}

/**
 * If this returns undefined it means at least one cache was not found
 */
function getBucketsForFilters(
  filters: Array<DbQuery>,
  nodeTypeNames: Array<string>,
  filtersCache: FiltersCache
): Array<Array<IGatsbyNode>> | undefined {
  const nodesPerValueArrs: Array<Array<IGatsbyNode>> = []

  // Fail fast while trying to create and get the value-cache for each path
  const every = filters.every(filter => {
    const filterCacheKey = createFilterCacheKey(nodeTypeNames, filter)
    if (filter.type === `query`) {
      // (Let TS warn us if a new query type gets added)
      const q: IDbQueryQuery = filter
      return getBucketsForQueryFilter(
        filterCacheKey,
        q,
        nodeTypeNames,
        filtersCache,
        nodesPerValueArrs
      )
    } else {
      // (Let TS warn us if a new query type gets added)
      const q: IDbQueryElemMatch = filter
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
 * Returns `false` if it found none.
 */
function getBucketsForQueryFilter(
  filterCacheKey: FilterCacheKey,
  filter: IDbQueryQuery,
  nodeTypeNames: Array<string>,
  filtersCache: FiltersCache,
  nodesPerValueArrs: Array<Array<IGatsbyNode>>
): boolean {
  const {
    path: filterPath,
    query: { comparator, value: filterValue },
  } = filter

  if (!filtersCache.has(filterCacheKey)) {
    ensureIndexByQuery(
      comparator as FilterOp,
      filterCacheKey,
      filterPath,
      nodeTypeNames,
      filtersCache
    )
  }

  const nodesPerValue = getNodesFromCacheByValue(
    filterCacheKey,
    filterValue as FilterValueNullable,
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
 * Matching node arrs are put in given array by reference
 */
function collectBucketForElemMatch(
  filterCacheKey: FilterCacheKey,
  filter: IDbQueryElemMatch,
  nodeTypeNames: Array<string>,
  filtersCache: FiltersCache,
  nodesPerValueArrs: Array<Array<IGatsbyNode>>
): boolean {
  // Get comparator and target value for this elemMatch
  let comparator: FilterOp = `$eq` // (Must be overridden but TS requires init)
  let targetValue: FilterValueNullable = null
  let f: DbQuery = filter
  while (f) {
    if (f.type === `elemMatch`) {
      const q: IDbQueryElemMatch = f
      f = q.nestedQuery
    } else {
      const q: IDbQueryQuery = f
      comparator = q.query.comparator as FilterOp
      targetValue = q.query.value as FilterValueNullable
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

  const nodesByValue = getNodesFromCacheByValue(
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
 * @property {{filter?: Object, sort?: Object, skip?: number, limit?: number} | undefined} args.queryArgs
 * @property {FiltersCache} args.filtersCache A cache of indexes where you can
 *   look up Nodes grouped by a FilterCacheKey, which yields a Map which holds
 *   an arr of Nodes for the value that the filter is trying to query against.
 *   This object lives in query/query-runner.js and is passed down runQuery.
 * @returns Collection of results. Collection will be sliced by `skip` and `limit`
 */
export function runFastFiltersAndSort(args: IRunFilterArg): IQueryResult {
  const {
    queryArgs: { filter, sort, limit, skip = 0 } = {},
    resolvedFields = {},
    nodeTypeNames,
    filtersCache,
    stats,
  } = args

  const result = convertAndApplyFastFilters(
    filter,
    nodeTypeNames,
    filtersCache,
    resolvedFields,
    stats
  )

  const sortedResult = sortNodes(result, sort, resolvedFields, stats)
  const totalCount = sortedResult.length

  const entries =
    skip || limit
      ? sortedResult.slice(skip, limit ? skip + (limit ?? 0) : undefined)
      : sortedResult

  return { entries, totalCount }
}

/**
 * Return a collection of results.
 */
function convertAndApplyFastFilters(
  filterFields: Array<IInputQuery> | undefined,
  nodeTypeNames: Array<string>,
  filtersCache: FiltersCache,
  resolvedFields: Record<string, any>,
  stats: IGraphQLRunnerStats
): Array<IGatsbyNode> {
  const filters = filterFields
    ? prefixResolvedFields(
        createDbQueriesFromObject(prepareQueryArgs(filterFields)),
        resolvedFields
      )
    : []

  if (stats) {
    filters.forEach(filter => {
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
    const filterCacheKey = createFilterCacheKey(nodeTypeNames, null)
    if (!filtersCache.has(filterCacheKey)) {
      ensureEmptyFilterCache(filterCacheKey, nodeTypeNames, filtersCache)
    }

    // If there's a filter, there (now) must be an entry for this cache key
    const filterCache = filtersCache.get(filterCacheKey) as IFilterCache
    // If there is no filter then the ensureCache step will populate this:
    const cache = filterCache.meta.orderedByCounter as Array<IGatsbyNode>

    return cache.slice(0)
  }

  const result = applyFastFilters(filters, nodeTypeNames, filtersCache)

  if (result) {
    if (stats) {
      stats.totalIndexHits++
    }
    return result
  }

  if (stats) {
    // to mean, "empty results"
    stats.totalSiftHits++
  }

  return []
}

function filterToStats(
  filter: DbQuery,
  filterPath: Array<string> = [],
  comparatorPath: Array<string> = []
): {
  filterPath: Array<string>
  comparatorPath: Array<string>
} {
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
 * Returns same reference as input, sorted inline
 */
function sortNodes(
  nodes: Array<IGatsbyNode>,
  sort:
    | { fields: Array<string>; order: Array<boolean | "asc" | "desc"> }
    | undefined,
  resolvedFields: any,
  stats: IGraphQLRunnerStats
): Array<IGatsbyNode> {
  if (!sort || sort.fields?.length === 0 || !nodes || nodes.length === 0) {
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
  const sortFns = sortFields.map(field => (v): ((any) => any) =>
    getValueAt(v, field)
  )
  const sortOrder = sort.order.map(order =>
    typeof order === `boolean` ? order : order.toLowerCase()
  ) as Array<boolean | "asc" | "desc">

  if (stats) {
    sortFields.forEach(sortField => {
      stats.uniqueSorts.add(sortField)
    })
  }

  return _.orderBy(nodes, sortFns, sortOrder)
}
