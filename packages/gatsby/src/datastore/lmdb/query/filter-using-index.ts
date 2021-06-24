import { GatsbyIterable } from "../../common/iterable"
import {
  DbComparator,
  DbComparatorValue,
  DbQuery,
  dbQueryToDottedField,
  getFilterStatement,
  IDbFilterStatement,
} from "../../common/query"
import { IDataStore, ILmdbDatabases, NodeId } from "../../types"
import {
  IIndexMetadata,
  IndexFields,
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

const canUseIndex = new Set([
  DbComparator.EQ,
  DbComparator.IN,
  DbComparator.GTE,
  DbComparator.LTE,
  DbComparator.GT,
  DbComparator.LT,
  // TODO: NE and NIN can also potentially use indexes (need to invert eq/in ranges to make them work)
  // DbComparator.NE,
  // DbComparator.NIN
])

interface IFilterContext {
  datastore: IDataStore
  databases: ILmdbDatabases
  dbQueries: Array<DbQuery>
  indexMetadata: IIndexMetadata
  limit?: number
  skip?: number
  reverse?: boolean
}

export interface IFilterResult {
  entries: GatsbyIterable<IIndexEntry>
  usedQueries: Set<DbQuery>
}

/**
 * Note: since it returns full index entries - it may contain duplicates
 */
export function filterUsingIndex(context: IFilterContext): IFilterResult {
  const { dbQueries, indexMetadata } = context
  const indexFields = new Map(indexMetadata.keyFields)
  const { ranges, usedQueries } = getIndexRanges(dbQueries, indexFields)

  const result =
    ranges.length > 0
      ? performRangeScan(context, ranges, usedQueries)
      : performFullScan(context)

  if (usedQueries.size === dbQueries.length) {
    // Query is fully satisfied by the index, yay
    return result
  }

  return narrowResultsIfPossible(context, result)
}

export function countUsingIndex(context: IFilterContext): number {
  const {
    databases: { indexes },
    dbQueries,
    indexMetadata: { keyPrefix, keyFields, stats },
  } = context

  const indexFields = new Map(keyFields)

  const { ranges, usedQueries } = getIndexRanges(dbQueries, indexFields)

  if (usedQueries.size !== dbQueries.length) {
    throw new Error(
      `Cannot count using index. Some field filters cannot be resolved by index.`
    )
  }
  if (stats.maxKeysPerItem > 1) {
    // TODO: we probably can count in this case if all indexMetadata.multiKeyFields have `eq` filters in usedQueries
    //   Also for range-less queries by doing count/avgKeysPerItem
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

function performRangeScan(
  context: IFilterContext,
  ranges: Array<IIndexRange>,
  usedQueries: Set<DbQuery>
): IFilterResult {
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
      offset = 0
    }
    if (stats.maxKeysPerItem > 1) {
      // Cannot use limit:
      // MultiKey index may contain duplicates - we can only set a safe upper bound
      // TODO: we probably can use proper limit if all indexMetadata.multiKeyFields have `eq` filters in usedQueries
      limit *= stats.maxKeysPerItem
    }
  }

  console.log(`ranges`)
  let entries = new GatsbyIterable<IIndexEntry>([])
  for (let { start, end } of ranges) {
    start = [keyPrefix, ...start]
    end = [keyPrefix, ...end]
    const range = !reverse
      ? { start, end, limit, offset, snapshot: false }
      : { start: end, end: start, limit, offset, reverse, snapshot: false }

    console.log(`range`, range)

    // Assuming ranges are sorted and not overlapping, we can concat results
    const matches = indexes.getRange(range as any)
    entries = entries.concat(matches)
  }
  if (stats.maxKeysPerItem > 1) {
    // MultiKey indexes require additional deduplication step :/
    // TODO: probably no need if all indexMetadata.multiKeyFields have `eq` filters in usedQueries
    entries = entries.deduplicate(getIdentifier)
  }

  return {
    entries,
    usedQueries,
  }
}

function performFullScan(context: IFilterContext): IFilterResult {
  // *Caveat*: our old query implementation was putting undefined and null values at the end
  //   of the list when ordered ascending. But lmdb-store keeps them at the top.
  //   So in LMDB case, need to concat two ranges to conform to our old format:
  //     concat(undefinedToEnd, topToUndefined)
  const {
    databases: { indexes },
    reverse,
    indexMetadata: { keyPrefix },
  } = context
  // console.log(`full scan`)

  let start: RangeBoundary = [keyPrefix, getValueEdgeAfter(undefinedSymbol)]
  let end: RangeBoundary = [getValueEdgeAfter(keyPrefix)]
  let range = !reverse
    ? { start, end, snapshot: false }
    : { start: end, end: start, reverse, snapshot: false }

  // console.log(`full-scan-range1`, range)

  const undefinedToEnd: any = indexes.getRange(range as any) // FIXME: lmdb-store typing seems outdated

  // Concat null/undefined values
  end = start
  start = [keyPrefix, null]
  range = !reverse
    ? { start, end, snapshot: false }
    : { start: end, end: start, reverse, snapshot: false }
  const topToUndefined: any = indexes.getRange(range as any)

  // console.log(`full-scan-range2`, range, Array.from(topToUndefined))

  const result = new GatsbyIterable<IIndexEntry>(
    !reverse
      ? undefinedToEnd.concat(topToUndefined)
      : topToUndefined.concat(undefinedToEnd)
  )

  return {
    entries: result.deduplicate(getIdentifier),
    usedQueries: new Set(),
  }
}

/**
 * Takes results after the index scan and tries to filter them additionally with unused parts of the index.
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
  result: IFilterResult
): IFilterResult {
  const { indexMetadata, dbQueries } = context
  const usedQueries = new Set([...result.usedQueries])

  const fieldIndexInKey = new Map<string, number>()
  indexMetadata.keyFields.forEach(([fieldName], position) => {
    fieldIndexInKey.set(fieldName, position + 1) // +1 to offset index id at the beginning of the index
  })

  type Filter = [filter: IDbFilterStatement, fieldPositionInIndex: number]
  const filtersToApply: Array<Filter> = []

  for (const query of dbQueries) {
    if (usedQueries.has(query)) continue
    const fieldName = dbQueryToDottedField(query)
    const indexInKey = fieldIndexInKey.get(fieldName)
    if (typeof indexInKey === `undefined`) continue
    usedQueries.add(query)
    filtersToApply.push([getFilterStatement(query), indexInKey])
  }

  // console.log(`Narrowing result: `, filtersToApply)
  let items = 0
  const start = Date.now()
  let shown = false

  return {
    usedQueries,
    entries:
      filtersToApply.length === 0
        ? result.entries
        : result.entries.filter(({ key }) => {
            if (!shown && items++ > 5000) {
              shown = true
              console.log(
                `Narrowing huge dataset for: ${
                  indexMetadata.keyPrefix
                }; spent: ${Date.now() - start}ms`
              )
            }
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
          }),
  }
}

/**
 * Returns query clauses that can potentially use index.
 * Returned list is sorted by query specificity
 */
export function getQueriesThatCanUseIndex(all: Array<DbQuery>): Array<DbQuery> {
  return all
    .filter(q => canUseIndex.has(getFilterStatement(q).comparator))
    .sort(compareByPredicateSpecificity)
}

export function getIndexRanges(
  dbQueries: Array<DbQuery>,
  indexFields: IndexFields
): { usedQueries: Set<DbQuery>; ranges: Array<IIndexRange> } {
  const queriesThatCanUseIndex = getQueriesThatCanUseIndex(dbQueries)

  const usedQueries = new Set<DbQuery>()
  const rangeStarts: Array<RangeBoundary> = []
  const rangeEndings: Array<RangeBoundary> = []

  for (const indexField of indexFields) {
    const result = extractRanges(queriesThatCanUseIndex, indexField)
    if (!result.rangeStarts.length) {
      // No point to continue - just use index prefix, not all index fields
      break
    }
    result.usedQueries.forEach(q => usedQueries.add(q))
    rangeStarts.push(result.rangeStarts)
    rangeEndings.push(result.rangeEndings)
  }
  if (!rangeStarts.length) {
    return { usedQueries, ranges: [] }
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
  // TODO: sort ranges. Also, we may want this at some point:
  //   https://docs.mongodb.com/manual/core/multikey-index-bounds/
  return { usedQueries, ranges }
}

function extractRanges(
  queries: Array<DbQuery>,
  [indexField, sortDirection]: [fieldName: string, sortDirection: number]
): {
  usedQueries: Set<DbQuery>
  rangeStarts: RangeBoundary
  rangeEndings: RangeBoundary
} {
  // Tracking starts and ends separately instead of doing Array<[start, end]>
  //  to simplify cartesian product creation later
  const rangeStarts: RangeBoundary = []
  const rangeEndings: RangeBoundary = []

  // const ranges: Array<FieldRangeFilter> = []
  const used = new Set<DbQuery>()
  const fieldQueries = queries.filter(
    q => dbQueryToDottedField(q) === indexField
  )
  if (!fieldQueries.length) {
    return { rangeStarts, rangeEndings: rangeEndings, usedQueries: used }
  }
  // Assuming queries are sorted by specificity, the best bet is to pick the first query
  // TODO: add range intersection for most common cases (e.g. gte + ne)
  const bestMatchingQuery = fieldQueries[0]
  used.add(bestMatchingQuery)

  const filter = getFilterStatement(bestMatchingQuery)

  if (filter.comparator === DbComparator.IN && !Array.isArray(filter.value)) {
    throw new Error("The argument to the `in` comparator should be an array")
  }

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
      throw new Error(`Unsupported comparator: ${filter.comparator}`)
  }
  return { usedQueries: used, rangeStarts, rangeEndings }
}

function findRangeEdge(
  queries: Array<DbQuery>,
  usedQueries: Set<DbQuery>,
  comparator: DbComparator,
  edge: ValueEdges = ValueEdges.NONE
): IndexFieldValue | RangeEdgeBefore | RangeEdgeAfter | undefined {
  for (const dbQuery of queries) {
    if (usedQueries.has(dbQuery)) {
      continue
    }
    const filterStatement = getFilterStatement(dbQuery)
    if (filterStatement.comparator !== comparator) {
      continue
    }
    usedQueries.add(dbQuery)
    const value = filterStatement.value
    if (Array.isArray(value)) {
      throw new Error(`Range filter ${comparator} should not have array value`)
    }
    if (typeof value === `object` && value !== null) {
      throw new Error(
        `Range filter ${comparator} should not have value of type ${typeof value}`
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

function compareByPredicateSpecificity(a: DbQuery, b: DbQuery): number {
  const aPredicate = getFilterStatement(a).comparator
  const bPredicate = getFilterStatement(b).comparator
  if (aPredicate === bPredicate) {
    return 0
  }
  for (const comparator of canUseIndex) {
    if (comparator === aPredicate) {
      return -1
    }
    if (comparator === bPredicate) {
      return 1
    }
  }
  throw new Error(`Unexpected predicate pair: ${aPredicate}, ${bPredicate}`)
}

function toIndexFieldValue(
  filterValue: DbComparatorValue,
  filter: IDbFilterStatement
): IndexFieldValue {
  if (typeof filterValue === `object` && filterValue !== null) {
    throw new Error(
      `Bad filter value for filter ${filter.comparator}: ${inspect(
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
