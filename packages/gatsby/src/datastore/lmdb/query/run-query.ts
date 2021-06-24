import { IDataStore, ILmdbDatabases, IRunQueryArgs } from "../../types"
import { IGatsbyNode } from "../../../redux/types"
import { GatsbyIterable } from "../../common/iterable"
import {
  createDbQueriesFromObject,
  DbComparator,
  DbQuery,
  dbQueryToDottedField,
  getFilterStatement,
  IDbFilterStatement,
  prepareQueryArgs,
} from "../../common/query"
import { createIndex, IIndexMetadata, IndexFields } from "./create-index"
import {
  countUsingIndex,
  filterUsingIndex,
  IIndexEntry,
} from "./filter-using-index"
import { store } from "../../../redux"
import { isDesc, resolveFieldValue, shouldFilter } from "./common"
import { suggestIndex } from "./suggest-index"
import { compareKey } from "lmdb-store"

// Before running a query we create a separate index for all filter fields (unless it already exists)
//   Each index has exactly the same sort order (so technically the index key is [filterField, ...sortFields]).
//   Then when running a query we intersect results of all filters
//   (and since all results are pre-sorted by the same field - we can do this efficiently)
//
// Example. Imagine a list of blog posts:
//   [
//     { id: 1, category: `foo`, publishedAt: `2021-01-03`, views: 100 },
//     { id: 2, category: `foo`, publishedAt: `2021-01-03`, views: 200 },
//     { id: 3, category: `bar`, publishedAt: `2021-01-02`, views: 300 },
//     { id: 4, category: `foo`, publishedAt: `2021-01-01`, views: 400 }
//   ]
// And the following query:
//   {
//     filter: {
//       category: { eq: `foo` },
//       views: { gt: 100 }
//     },
//     sort: [`publishedAt`]
//   }
// Which index should we create?
// The caveat is that sorting with range queries cannot use index (same as in mongodb, or any similar db).
//
// So there are two strategies here:
// 1. Create index by `category` and `sort` + apply `views.gt` filter lazily to results fetched using index
// 2. Create index by `category` + `views`, then load all results in memory and sort them in memory.
//
// With the first strategy we create one compound index by fields `category` and `publishedAt`:
//   {
//     `bar.2021-01-02`: [3],
//     `foo.2021-01-01`: [4],
//     `foo.2021-01-03`: [1, 2],
//   }
// So `filter: { category: { eq: "foo" } }, sort: ["publishedAt"]` returns [4, 1, 2]
// Then when traversing this list we do [4,1,2].map(getNode).filter(node => node.views <= 100),
// so the final result is [4, 2]
//
// With the second strategy we create compound index by fields `category` and `views`:
//   {
//     `bar.300`: [3],
//     `foo.100`: [1],
//     `foo.200`: [2],
//     `foo.400`: [4],
//   }
//
// So `filter: { category: { eq: "foo" }, views: { gt: 100 }}` returns us [2, 4]
// But now we need to do `[2,4].map(getNode).sort((a,b) => a.publishedAt > b.publishedAt)` in JS
//
// Different strategies may be optimal in different cases.
// Some things to consider when choosing a strategy:
// 1. Ideally we should create as little number of indexes as possible.
//    So if some index already exists - just using it could be a good strategy.
// 2. Check out the total number of items in collection.
//    in-memory sorting is expensive for huge collections but can be relatively fast for small collections
// 3. When limit is set for a query (and especially LIMIT = 1) picking sorted index may be a better choice
// 4. ???
//
// TODO: Both strategies can be improved by including remaining data needed for sorting or filtering
//  in the index tail.
// E.g. for the first example index entry will become:
//   `bar.2021-01-02.300`
// In this case when filtering by `viwes` we don't need to load full node contents for filter.
//
// For the second example index entry will be:
//   `bar.300.2021-01-02`
// Same thing works for sorting - we can use `publishedAt` at the tail of the index and avoid
// loading all nodes in memory
//
// Sorting using indexes.
// Only `eq` and `in` filters support sorting with indexes by arbitrary fields:
//   {
//     filter: { foo: { eq: $value } }
//     sort: [`any_field`]
//   }
//   {
//     filter: { foo: { in: [$value1, $value2] } }
//     sort: [`any_field`]
//   }
//
// Range queries can leverage indexes for sorting only when sort fields include a filter field:
//   {
//     filter: { foo: { gt: $value } }
//     sort: [`foo`, `any_field`]
//   }
//
// Sort order significantly affects index selection
//
// So our current algo breaks down to:
// 1. If sorting is required
//    1.1 If sort order is mixed (mix of asc/desc with multiple fields): Fallback to fast filters for now
//      TODO: the solution is probably to still create index { foo: 1, bar: 1 }
//       but then buffer values with the same prefix for foo
//       and traverse them in the reverse order once buffer is full
//    1.2 If the query has `eq` or `in` comparator for some field:
//      1.2.1 Create index for this field: [field, ...sortFields]
//      1.2.2 Query this index with this `eq` or `in` filter and build sorted iterable
//      1.2.3 If there are any other filters - just add .filter()
//    1.3 All other cases:
//      1.3.1 Create an index by just sort fields: [...sortFields]
//      1.3.2 TODO: Check if there are any range filters matching this index prefix
//      1.3.3 Query this index (so walk through all nodes and filter with sift)
//
//    TODO: Other possible filtering strategies when sort is needed and cannot use index:
//     1. [Improved 1.3] Create index [...sortFields, filterField], walk through it and apply
//        sift filter to every node. But use data from the index itself for filtering
//          (this way we don't need to load full node data to filter)
//     2. [Alternative] Apply filters, and sort all results in memory
//     How to choose:
//       a) when total number of nodes of the given type is small - use #1
//       b) when limit is set - use #1
//       c) when query has range filters and some index already exists that covers ranges
//          probe counts for a given range - and if the biggest result is 10x smaller than the total number of nodes
//          use #2
//
// 2. Sorting is not required
//    2.1 Query has `eq`, `in` or range filters
//      2.1.1 Create compound index for at most 3 fields with comparators (from more specific to less specific):
//            `eq`, `in`, `gte`, `lte`, `gt`, `lt`
//            [...eqFields, ...inFields, ...gteFields, ...lteFields, ...gtFields, ...ltFields]
//      2.1.2 Query this index
//      2.1.3 If there are additional filters not satisfied by the index - apply them using sift on results
//    2.2 Query only has `ne`, `nin`, `regex`, `glob` filters
//      TODO: 2.2.1 try to find existing index and use index data for initial filtering
//      2.2.2 Just loop through all nodes and apply sift filters

// Behavior changes:
// 1. Materialization result is now stored in index.
//    So if it is non-deterministic or depends on other nodes that change
//    independently of this node - it will contain stale results in warm builds.
//    TODO: consider always excluding materialized fields from indexes.
//      in this case query can still use indexes for other fields
//      but will need to sort/filter in JS additionally by materialization fields.
//      OR require schema customization authors to mark custom resolvers as side-effect free
// 2. Sorting within equal values may vary
// 3. FIXME:
//    Sorting on fields that have `null` and `undefined`
//    our current solution ASC: number, null, undefined
//    lmdb-store ASC: null, undefined, number

interface IDoRunQueryArgs extends IRunQueryArgs {
  databases: ILmdbDatabases
  datastore: IDataStore
}

type SortFields = Map<string, number>

interface IQueryContext {
  datastore: IDataStore
  databases: ILmdbDatabases
  dbQueries: Array<DbQuery>
  sortFields: SortFields
  nodeTypeNames: Array<string>
  suggestedIndexFields: IndexFields
  indexMetadata?: IIndexMetadata
  limit?: number
  skip: number
}

export async function doRunQuery(
  args: IDoRunQueryArgs
): Promise<{ entries: GatsbyIterable<IGatsbyNode> }> {
  const context = createQueryContext(args)

  const entries = canUseIndex(context)
    ? await performIndexScan(context)
    : await performFullTableScan(context)

  return { entries }
}

export async function performIndexScan(
  context: IQueryContext
): Promise<GatsbyIterable<IGatsbyNode>> {
  let result = new GatsbyIterable<IGatsbyNode>([])
  for (const typeName of context.nodeTypeNames) {
    const indexMetadata = await createIndex(
      context,
      typeName,
      context.suggestedIndexFields
    )
    if (!needsSorting(context)) {
      const nodes = await filterNodes(context, indexMetadata)
      result = result.concat(nodes)
      continue
    }
    if (canUseIndexForSorting(indexMetadata, context.sortFields)) {
      const nodes = await filterNodes(context, indexMetadata)
      // Interleave nodes of different types (not expensive for already sorted chunks)
      result = result.mergeSorted(
        nodes,
        createNodeSortComparator(context.sortFields)
      )
      continue
    }
    // The sad part - unlimited filter + in-memory sort
    const unlimited = { ...context, skip: 0, limit: undefined }
    const nodes = await filterNodes(unlimited, indexMetadata)
    const sortedNodes = sortNodesInMemory(context, nodes)

    result = result.mergeSorted(
      sortedNodes,
      createNodeSortComparator(context.sortFields)
    )
  }
  const { limit, skip = 0 } = context

  if (limit || skip) {
    result = result.slice(skip, limit ? skip + limit : undefined)
  }
  return result
}

async function performCount(context: IQueryContext): Promise<number> {
  let count = 0
  for (const typeName of context.nodeTypeNames) {
    const indexMetadata = await createIndex(
      context,
      typeName,
      context.suggestedIndexFields
    )
    try {
      const typeCount = countUsingIndex({
        ...context,
        indexMetadata,
      })
      count += typeCount
    } catch (e) {
      // We cannot reliably count using index - fallback to full iteration :/
      const entries = await filterNodes(context, indexMetadata)
      for (const _ of entries) count++
    }
  }
  return count
}

async function performFullTableScan(
  context: IQueryContext
): Promise<GatsbyIterable<IGatsbyNode>> {
  console.warn(`Fallback to full table scan :/`)

  const { datastore, nodeTypeNames } = context

  let result = new GatsbyIterable<IGatsbyNode>([])
  for (const typeName of nodeTypeNames) {
    let nodes = new GatsbyIterable(() => datastore.iterateNodesByType(typeName))
    nodes = completeFiltering(context, nodes)

    if (needsSorting(context)) {
      nodes = sortNodesInMemory(context, nodes)
      result = result.mergeSorted(
        nodes,
        createNodeSortComparator(context.sortFields)
      )
    } else {
      result = result.concat(nodes)
    }
  }
  const { limit, skip = 0 } = context

  if (limit || skip) {
    result = result.slice(skip, limit ? skip + limit : undefined)
  }
  return result
}

async function filterNodes(
  context: IQueryContext,
  indexMetadata: IIndexMetadata
): Promise<GatsbyIterable<IGatsbyNode>> {
  const { entries, usedQueries } = await filterUsingIndex({
    ...context,
    indexMetadata,
    reverse: Array.from(context.sortFields.values())[0] === -1,
  })
  const nodes = entries
    .map(({ value }) => context.datastore.getNode(value))
    .filter(Boolean)

  return completeFiltering(
    context,
    nodes as GatsbyIterable<IGatsbyNode>,
    usedQueries
  )
}

/**
 * Takes intermediate result and applies any remaining dbQueries.
 *
 * If result is already fully filtered - simply returns.
 */
function completeFiltering(
  context: IQueryContext,
  intermediateResult: GatsbyIterable<IGatsbyNode>,
  usedQueries: Set<DbQuery> = new Set()
): GatsbyIterable<IGatsbyNode> {
  const { dbQueries } = context
  if (isFullyFiltered(dbQueries, usedQueries)) {
    return intermediateResult
  }
  // Apply remaining filter operations directly (last resort: slow)
  const resolvedNodes = store.getState().resolvedNodesCache

  const filtersToApply: Array<[string, IDbFilterStatement]> = dbQueries
    .filter(q => !usedQueries.has(q))
    .map(q => [dbQueryToDottedField(q), getFilterStatement(q)])

  // console.log(`have to complete results`, filtersToApply)

  let items = 0
  const start = Date.now()
  let shown = true

  return intermediateResult.filter(node => {
    const resolvedFields = resolvedNodes?.get(node.internal.type)?.get(node.id)

    for (const [dottedField, filter] of filtersToApply) {
      ++items
      if (items % 1000 === 0) shown = false
      if (!shown) {
        shown = true
        console.log(
          `Completing huge dataset (${items} items so far) for: ${
            node.internal.type
          }.${dottedField}; spent: ${Date.now() - start}ms;`
        )
      }
      const tmp = resolveFieldValue(dottedField, node, resolvedFields)
      const value = Array.isArray(tmp) ? tmp : [tmp]
      if (value.some(v => !shouldFilter(filter, v))) {
        // Mimic AND semantics
        return false
      }
    }
    return true
  })
}

function sortNodesInMemory(
  context: IQueryContext,
  nodes: GatsbyIterable<IGatsbyNode>
): GatsbyIterable<IGatsbyNode> {
  // TODO: Nodes can be partially sorted by index prefix - we can (and should) exploit this
  return new GatsbyIterable(() => {
    const arr = Array.from(nodes)
    arr.sort(createNodeSortComparator(context.sortFields))
    return arr
  })
}

function createQueryContext(args: IDoRunQueryArgs): IQueryContext {
  const { queryArgs: { filter, sort, limit, skip = 0 } = {}, firstOnly } = args

  return {
    datastore: args.datastore,
    databases: args.databases,
    nodeTypeNames: args.nodeTypeNames,
    dbQueries: createDbQueriesFromObject(prepareQueryArgs(filter)),
    sortFields: new Map<string, number>(
      sort?.fields.map((field, i) => [field, isDesc(sort?.order[i]) ? -1 : 1])
    ),
    suggestedIndexFields: new Map(suggestIndex({ filter, sort })),
    limit: firstOnly ? 1 : limit,
    skip,
  }
}

function canUseIndex(context: IQueryContext): boolean {
  return context.suggestedIndexFields.size > 0
}

function needsSorting(context: IQueryContext): boolean {
  return context.sortFields.size > 0
}

/**
 * Based on assumption that if all sort fields exist in index
 * then any result received from this index is fully sorted
 */
function canUseIndexForSorting(
  index: IIndexMetadata,
  sortFields: SortFields
): boolean {
  const indexKeyFields = new Map(index.keyFields)
  for (const [field, sortOrder] of sortFields) {
    if (indexKeyFields.get(field) !== sortOrder) {
      return false
    }
  }
  return true
}

function isFullyFiltered(
  dbQueries: Array<DbQuery>,
  usedQueries: Set<DbQuery>
): boolean {
  return dbQueries.length === usedQueries.size
}

function getEqQueries(dbQueries: Array<DbQuery>): Array<DbQuery> {
  return dbQueries.filter(
    q => getFilterStatement(q).comparator === DbComparator.EQ
  )
}

function isMixedSortOrder(
  sortFields: Array<string>,
  sortOrder: Array<"asc" | "desc" | boolean>
): boolean {
  const first = isDesc(sortOrder[0])
  return sortFields.some((_, index) => isDesc(sortOrder[index]) !== first)
}

function createNodeSortComparator(sortFields: SortFields): (a, b) => number {
  const resolvedNodesCache = store.getState().resolvedNodesCache

  return function nodeComparator(a: IGatsbyNode, b: IGatsbyNode): number {
    const resolvedAFields = resolvedNodesCache?.get(a.internal.type)?.get(a.id)
    const resolvedBFields = resolvedNodesCache?.get(b.internal.type)?.get(b.id)

    for (const [field, direction] of sortFields) {
      const valueA: any = resolveFieldValue(field, a, resolvedAFields)
      const valueB: any = resolveFieldValue(field, b, resolvedBFields)

      if (valueA > valueB) {
        return direction === 1 ? 1 : -1
      } else if (valueA < valueB) {
        return direction === 1 ? -1 : 1
      }
    }
    return 0
  }
}

export function compareByKeySuffix(prefixLength: number) {
  return function (a: IIndexEntry, b: IIndexEntry): number {
    const aSuffix = a.key.slice(prefixLength)
    const bSuffix = b.key.slice(prefixLength)
    // @ts-ignore
    return compareKey(aSuffix, bSuffix)
  }
}
