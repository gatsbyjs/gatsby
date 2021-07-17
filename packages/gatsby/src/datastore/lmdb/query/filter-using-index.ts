import { GatsbyIterable } from "../../common/iterable"
import {
  DbComparator,
  DbComparatorValue,
  DbQuery,
  dbQueryToDottedField,
  getFilterStatement,
  IDbFilterStatement,
  sortBySpecificity,
} from "../../common/query"
import { IDataStore, ILmdbDatabases, NodeId } from "../../types"
import {
  IIndexMetadata,
  IndexFieldValue,
  IndexKey,
  undefinedSymbol,
} from "./create-index"
import { cartesianProduct, shouldFilter } from "./common"
import { inspect } from "util"

// JS values encoded by ordered-binary never start with 0 or 255 byte
export const BinaryInfinityNegative = Buffer.from([0])
export const BinaryInfinityPositive = String.fromCharCode(255).repeat(4)

type RangeEdgeAfter = [IndexFieldValue, typeof BinaryInfinityPositive]
type RangeEdgeBefore = [typeof undefinedSymbol, IndexFieldValue]
type RangeValue =
  | IndexFieldValue
  | RangeEdgeAfter
  | RangeEdgeBefore
  | typeof BinaryInfinityPositive
  | typeof BinaryInfinityNegative
type RangeBoundary = Array<RangeValue>

export interface IIndexEntry {
  key: IndexKey
  value: NodeId
}

interface IIndexRange {
  start: RangeBoundary
  end: RangeBoundary
}

enum ValueEdges {
  BEFORE = -1,
  NONE = 0,
  AFTER = 1,
}

export interface IFilterArgs {
  datastore: IDataStore
  databases: ILmdbDatabases
  dbQueries: Array<DbQuery>
  indexMetadata: IIndexMetadata
  limit?: number
  skip?: number
  reverse?: boolean
}

interface IFilterContext extends IFilterArgs {
  usedQueries: Set<DbQuery>
}

export interface IFilterResult {
  entries: GatsbyIterable<IIndexEntry>
  usedQueries: Set<DbQuery>
}

export function filterUsingIndex(args: IFilterArgs): IFilterResult {
  const context = createFilteringContext(args)
  const ranges = getIndexRanges(context, args.dbQueries)

  let entries = new GatsbyIterable<IIndexEntry>(() =>
    ranges.length > 0
      ? performRangeScan(context, ranges)
      : performFullScan(context)
  )
  if (context.usedQueries.size !== args.dbQueries.length) {
    // Try to additionally filter out results using data stored in index
    entries = narrowResultsIfPossible(context, entries)
  }
  if (isMultiKeyIndex(context) && needsDeduplication(context)) {
    entries = entries.deduplicate(getIdentifier)
  }
  return { entries, usedQueries: context.usedQueries }
}

export function countUsingIndexOnly(args: IFilterArgs): number {
  const context = createFilteringContext(args)
  const {
    databases: { indexes },
    dbQueries,
    indexMetadata: { keyPrefix },
  } = args

  const ranges = getIndexRanges(context, args.dbQueries)

  if (context.usedQueries.size !== dbQueries.length) {
    throw new Error(`Cannot count using index only`)
  }
  if (isMultiKeyIndex(context) && needsDeduplication(context)) {
    throw new Error(`Cannot count using MultiKey index.`)
  }
  if (ranges.length === 0) {
    return indexes.getKeysCount({
      start: [keyPrefix],
      end: [getValueEdgeAfter(keyPrefix)],
      snapshot: false,
    } as any)
  }
  let count = 0
  for (let { start, end } of ranges) {
    start = [keyPrefix, ...start]
    end = [keyPrefix, ...end]
    // Assuming ranges are not overlapping
    count += indexes.getKeysCount({ start, end, snapshot: false } as any)
  }
  return count
}

function createFilteringContext(args: IFilterArgs): IFilterContext {
  return {
    ...args,
    usedQueries: new Set<DbQuery>(),
  }
}

function isMultiKeyIndex(context: IFilterContext): boolean {
  return context.indexMetadata.multiKeyFields.length > 0
}

function needsDeduplication(context: IFilterContext): boolean {
  if (!isMultiKeyIndex(context)) {
    return false
  }
  // Deduplication is not needed if all multiKeyFields have applied `eq` filters
  const fieldsWithAppliedEq = new Set<string>()
  context.usedQueries.forEach(q => {
    const filter = getFilterStatement(q)
    if (filter.comparator === DbComparator.EQ) {
      fieldsWithAppliedEq.add(dbQueryToDottedField(q))
    }
  })
  return context.indexMetadata.multiKeyFields.some(
    fieldName => !fieldsWithAppliedEq.has(fieldName)
  )
}

function* performRangeScan(
  context: IFilterContext,
  ranges: Array<IIndexRange>
): Generator<IIndexEntry> {
  const {
    databases: { indexes },
    indexMetadata: { keyPrefix, stats },
    reverse,
  } = context

  let { limit, skip: offset = 0 } = context

  if (limit) {
    if (ranges.length > 1) {
      // e.g. { in: [1, 2] }
      // Cannot use offset: we will run several range queries and it's not clear which one to offset
      // TODO: assuming ranges are sorted and not overlapping it should be possible to use offsets in this case
      //   by running first range query, counting results while lazily iterating and
      //   running the next range query when the previous iterator is done (and count is known)
      //   with offset = offset - previousRangeCount, limit = limit - previousRangeCount
      limit = offset + limit
      offset = 0
    }
    if (isMultiKeyIndex(context) && needsDeduplication(context)) {
      // Cannot use limit:
      // MultiKey index may contain duplicates - we can only set a safe upper bound
      limit *= stats.maxKeysPerItem
    }
  }
  // Assuming ranges are sorted and not overlapping, we can yield results sequentially
  for (let { start, end } of ranges) {
    start = [keyPrefix, ...start]
    end = [keyPrefix, ...end]
    const range = !reverse
      ? { start, end, limit, offset, snapshot: false }
      : { start: end, end: start, limit, offset, reverse, snapshot: false }

    // @ts-ignore
    yield* indexes.getRange(range)
  }
}

function* performFullScan(context: IFilterArgs): Generator<IIndexEntry> {
  // *Caveat*: our old query implementation was putting undefined and null values at the end
  //   of the list when ordered ascending. But lmdb-store keeps them at the top.
  //   So in LMDB case, need to concat two ranges to conform to our old format:
  //     concat(undefinedToEnd, topToUndefined)
  const {
    databases: { indexes },
    reverse,
    indexMetadata: { keyPrefix },
  } = context

  let start: RangeBoundary = [keyPrefix, getValueEdgeAfter(undefinedSymbol)]
  let end: RangeBoundary = [getValueEdgeAfter(keyPrefix)]
  let range = !reverse
    ? { start, end, snapshot: false }
    : { start: end, end: start, reverse, snapshot: false }

  const undefinedToEnd = range

  // Concat null/undefined values
  end = start
  start = [keyPrefix, null]
  range = !reverse
    ? { start, end, snapshot: false }
    : { start: end, end: start, reverse, snapshot: false }

  const topToUndefined = range

  if (!reverse) {
    // @ts-ignore
    yield* indexes.getRange(undefinedToEnd)
    // @ts-ignore
    yield* indexes.getRange(topToUndefined)
  } else {
    // @ts-ignore
    yield* indexes.getRange(topToUndefined)
    // @ts-ignore
    yield* indexes.getRange(undefinedToEnd)
  }
}

/**
 * Takes results after the index scan and tries to filter them additionally with unused parts of the query.
 *
 * This is O(N) but the advantage is that it uses data available in the index.
 * So it effectively bypasses the `getNode()` call for such filters (with all associated deserialization complexity).
 *
 * Example:
 *   Imagine the index is: { foo: 1, bar: 1 }
 *
 * Now we run the query:
 *   sort: [`foo`]
 *   filter: { bar: { eq: `test` }}
 *
 * Initial filtering pass will have to perform a full index scan (because `bar` is the last field in the index).
 *
 * But we still have values of `bar` stored in the index itself,
 * so can filter by this value without loading the full node contents.
 */
function narrowResultsIfPossible(
  context: IFilterContext,
  entries: GatsbyIterable<IIndexEntry>
): GatsbyIterable<IIndexEntry> {
  const { indexMetadata, dbQueries, usedQueries } = context

  const indexFields = new Map<string, number>()
  indexMetadata.keyFields.forEach(([fieldName], positionInKey) => {
    // Every index key is [indexId, field1, field2, ...] and `indexMetadata.keyFields` contains [field1, field2, ...]
    // As `indexId` is in the first column the fields need to be offset by +1 for correct addressing
    indexFields.set(fieldName, positionInKey + 1)
  })

  type Filter = [filter: IDbFilterStatement, fieldPositionInIndex: number]
  const filtersToApply: Array<Filter> = []

  for (const query of dbQueries) {
    const fieldName = dbQueryToDottedField(query)
    const positionInKey = indexFields.get(fieldName)

    if (typeof positionInKey === `undefined`) {
      // No data for this field in index
      continue
    }
    if (usedQueries.has(query)) {
      // Filter is already applied
      continue
    }
    const filter = getFilterStatement(query)
    filtersToApply.push([filter, positionInKey])
    usedQueries.add(query)
  }

  return filtersToApply.length === 0
    ? entries
    : entries.filter(({ key }) => {
        for (const [filter, fieldPositionInIndex] of filtersToApply) {
          const value =
            key[fieldPositionInIndex] === undefinedSymbol
              ? undefined
              : key[fieldPositionInIndex]

          if (!shouldFilter(filter, value)) {
            // Mimic AND semantics
            return false
          }
        }
        return true
      })
}

const isSupported = new Set([
  DbComparator.EQ,
  DbComparator.IN,
  DbComparator.GTE,
  DbComparator.LTE,
  DbComparator.GT,
  DbComparator.LT,
])

/**
 * Returns query clauses that can potentially use index.
 * Returned list is sorted by query specificity
 */
function getSupportedRangeQueries(dbQueries: Array<DbQuery>): Array<DbQuery> {
  const supportedQueries = dbQueries.filter(query =>
    isSupported.has(getFilterStatement(query).comparator)
  )
  return sortBySpecificity(supportedQueries)
}

export function getIndexRanges(
  context: IFilterContext,
  dbQueries: Array<DbQuery>
): Array<IIndexRange> {
  const {
    indexMetadata: { keyFields },
  } = context
  const rangeStarts: Array<RangeBoundary> = []
  const rangeEndings: Array<RangeBoundary> = []
  const supportedQueries = getSupportedRangeQueries(dbQueries)

  for (const indexField of new Map(keyFields)) {
    const result = getIndexFieldRanges(context, supportedQueries, indexField)

    if (!result.rangeStarts.length) {
      // No point to continue - just use index prefix, not all index fields
      break
    }
    rangeStarts.push(result.rangeStarts)
    rangeEndings.push(result.rangeEndings)
  }
  if (!rangeStarts.length) {
    return []
  }
  // Example:
  //   rangeStarts: [
  //     [field1Start1, field1Start2],
  //     [field2Start1],
  //   ]
  //   rangeEnds: [
  //     [field1End1, field1End2],
  //     [field2End1],
  //   ]
  // Need:
  //   rangeStartsProduct: [
  //     [field1Start1, field2Start1],
  //     [field1Start2, field2Start1],
  //   ]
  //   rangeEndingsProduct: [
  //     [field1End1, field2End1],
  //     [field1End2, field2End1],
  //   ]
  const rangeStartsProduct = cartesianProduct(...rangeStarts)
  const rangeEndingsProduct = cartesianProduct(...rangeEndings)

  const ranges: Array<IIndexRange> = []
  for (let i = 0; i < rangeStartsProduct.length; i++) {
    ranges.push({
      start: rangeStartsProduct[i],
      end: rangeEndingsProduct[i],
    })
  }
  // TODO: sort and intersect ranges. Also, we may want this at some point:
  //   https://docs.mongodb.com/manual/core/multikey-index-bounds/
  return ranges
}

function getIndexFieldRanges(
  context: IFilterContext,
  queries: Array<DbQuery>,
  [indexField, sortDirection]: [fieldName: string, sortDirection: number]
): {
  rangeStarts: RangeBoundary
  rangeEndings: RangeBoundary
} {
  // Tracking starts and ends separately instead of doing Array<[start, end]>
  //  to simplify cartesian product creation later
  const rangeStarts: RangeBoundary = []
  const rangeEndings: RangeBoundary = []

  const fieldQueries = queries.filter(
    q => dbQueryToDottedField(q) === indexField
  )
  if (!fieldQueries.length) {
    return { rangeStarts, rangeEndings }
  }
  // Assuming queries are sorted by specificity, the best bet is to pick the first query
  // TODO: add range intersection for most common cases (e.g. gte + ne)
  const bestMatchingQuery = fieldQueries[0]
  const filter = getFilterStatement(bestMatchingQuery)

  if (filter.comparator === DbComparator.IN && !Array.isArray(filter.value)) {
    throw new Error("The argument to the `in` predicate should be an array")
  }

  context.usedQueries.add(bestMatchingQuery)

  switch (filter.comparator) {
    case DbComparator.EQ:
    case DbComparator.IN: {
      const arr = Array.isArray(filter.value)
        ? [...filter.value]
        : [filter.value]

      // Sort ranges by index sort direction
      arr.sort((a: any, b: any): number => {
        if (a === b) return 0
        if (sortDirection === 1) return a > b ? 1 : -1
        return a < b ? 1 : -1
      })
      // TODO: ideally do range intersections with other queries (e.g. $in + $gt + $lt)
      //  although it is likely something like 0.1% of cases
      //  (right now it applies additional filters in runQuery.completeFiltering)

      let hasNull = false
      for (const item of new Set(arr)) {
        const value = toIndexFieldValue(item, filter)
        if (value === null) hasNull = true
        rangeStarts.push(value)
        rangeEndings.push(getValueEdgeAfter(value))
      }
      // Special case: { eq: null } or { in: [null, `any`]} must also include values for undefined!
      if (hasNull) {
        rangeStarts.push(undefinedSymbol)
        rangeEndings.push(getValueEdgeAfter(undefinedSymbol))
      }
      break
    }
    case DbComparator.LT:
    case DbComparator.LTE: {
      if (Array.isArray(filter.value))
        throw new Error(`${filter.comparator} value must not be an array`)

      const value = toIndexFieldValue(filter.value, filter)
      const end =
        filter.comparator === DbComparator.LT ? value : getValueEdgeAfter(value)

      // Try to find matching GTE/GT filter
      const used = context.usedQueries
      const start =
        findRangeEdge(fieldQueries, used, DbComparator.GTE) ??
        findRangeEdge(fieldQueries, used, DbComparator.GT, ValueEdges.AFTER)

      // Do not include null or undefined in results unless null was requested explicitly
      //
      // Index ordering:
      //  BinaryInfinityNegative
      //  null
      //  Symbol(`undef`)
      //  -10
      //  10
      //  `Hello`
      //  [`Hello`]
      //  BinaryInfinityPositive
      const rangeHead =
        value === null
          ? BinaryInfinityNegative
          : getValueEdgeAfter(undefinedSymbol)

      rangeStarts.push(start ?? rangeHead)
      rangeEndings.push(end)
      break
    }
    case DbComparator.GT:
    case DbComparator.GTE: {
      if (Array.isArray(filter.value))
        throw new Error(`${filter.comparator} value must not be an array`)

      const value = toIndexFieldValue(filter.value, filter)
      const start =
        filter.comparator === DbComparator.GTE
          ? value
          : getValueEdgeAfter(value)

      // Try to find matching LT/LTE
      const used = context.usedQueries
      const end =
        findRangeEdge(fieldQueries, used, DbComparator.LTE, ValueEdges.AFTER) ??
        findRangeEdge(fieldQueries, used, DbComparator.LT)

      const rangeTail =
        value === null ? getValueEdgeAfter(null) : BinaryInfinityPositive

      rangeStarts.push(start)
      rangeEndings.push(end ?? rangeTail)
      break
    }
    default:
      throw new Error(`Unsupported predicate: ${filter.comparator}`)
  }
  return { rangeStarts, rangeEndings }
}

function findRangeEdge(
  queries: Array<DbQuery>,
  usedQueries: Set<DbQuery>,
  predicate: DbComparator,
  edge: ValueEdges = ValueEdges.NONE
): IndexFieldValue | RangeEdgeBefore | RangeEdgeAfter | undefined {
  for (const dbQuery of queries) {
    if (usedQueries.has(dbQuery)) {
      continue
    }
    const filterStatement = getFilterStatement(dbQuery)
    if (filterStatement.comparator !== predicate) {
      continue
    }
    usedQueries.add(dbQuery)
    const value = filterStatement.value
    if (Array.isArray(value)) {
      throw new Error(`Range filter ${predicate} should not have array value`)
    }
    if (typeof value === `object` && value !== null) {
      throw new Error(
        `Range filter ${predicate} should not have value of type ${typeof value}`
      )
    }
    if (edge === 0) {
      return value
    }
    return edge < 0 ? getValueEdgeBefore(value) : getValueEdgeAfter(value)
  }
  return undefined
}

/**
 * Returns the edge after the given value, suitable for lmdb range queries.
 *
 * Example:
 * Get all items from index starting with ["foo"] prefix up to the next existing prefix:
 *
 * ```js
 *   db.getRange({ start: ["foo"], end: [getValueEdgeAfter("foo")] })
 * ```
 *
 * This method relies on ordered-binary format used by lmdb-store to persist keys
 * and assumes keys are composite and represented as arrays.
 *
 * Implementation detail: ordered-binary treats `null` as multipart separator within binary sequence
 */
function getValueEdgeAfter(value: IndexFieldValue): RangeEdgeAfter {
  return [value, BinaryInfinityPositive]
}
function getValueEdgeBefore(value: IndexFieldValue): RangeEdgeBefore {
  return [undefinedSymbol, value]
}

function toIndexFieldValue(
  filterValue: DbComparatorValue,
  filter: IDbFilterStatement
): IndexFieldValue {
  if (typeof filterValue === `object` && filterValue !== null) {
    throw new Error(
      `Bad filter value for predicate ${filter.comparator}: ${inspect(
        filter.value
      )}`
    )
  }
  return filterValue
}

function getIdentifier(entry: IIndexEntry): number | string {
  const id = entry.key[entry.key.length - 1]
  if (typeof id !== `number` && typeof id !== `string`) {
    const out = inspect(id)
    throw new Error(
      `Last element of index key is expected to be numeric or string id, got ${out}`
    )
  }
  return id
}
