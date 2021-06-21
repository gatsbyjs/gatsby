import { IDataStore, IGatsbyIterable, ILmdbDatabases } from "../../types"
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
import { IRunFilterArg } from "../../in-memory/run-fast-filters"
import { createIndex, IIndexFields } from "./create-index"
import {
  filterUsingIndex,
  getQueriesThatCanUseIndex,
} from "./filter-using-index"
import { store } from "../../../redux"
import { resolveFieldValue, shouldFilter } from "./common"

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

export interface IRunQueryArgs extends IRunFilterArg {
  databases: ILmdbDatabases
  datastore: IDataStore
}

export const stats = new Map()
let interval

export async function doRunQuery(
  args: IRunQueryArgs
): Promise<GatsbyIterable<IGatsbyNode>> {
  const {
    nodeTypeNames,
    queryArgs: { filter, sort, limit, skip = 0 } = {},
    firstOnly,
  } = args
  const sortFields = sort?.fields ?? []

  const queryKey =
    nodeTypeNames.join(`,`) +
    `;filter: ${JSON.stringify(filter)}; sort: ${JSON.stringify(sort)}`

  const start = Date.now()
  let result =
    sortFields.length > 0
      ? await runQueryWithSort(args)
      : await runQueryWithoutSort(args)

  if (firstOnly) {
    result = result.slice(0, 1)
  } else if (limit) {
    // console.log(`zzz`, skip, limit, Array.from(result))
    result = result.slice(0, skip + limit + 1)
  }
  const end = Date.now() - start
  const time = stats.get(queryKey) ?? 0
  stats.set(queryKey, time + (end - start))

  if (!interval) {
    interval = setInterval(output, 10000)
  }

  // console.log(r)
  return result
}

function output(): void {
  stats.forEach((time, key) => {
    if (time > 5 * 1000) {
      console.log(`[long] ${key}:`, time)
    }
  })
}

async function runQueryWithSort(
  args: IRunQueryArgs
): Promise<GatsbyIterable<IGatsbyNode>> {
  const {
    nodeTypeNames,
    queryArgs: { filter, sort } = {},
    datastore,
    // firstOnly = false,
  } = args

  const sortFields = sort?.fields ?? []
  const sortOrder = sort?.order ?? []
  const dbQueries = createDbQueriesFromObject(prepareQueryArgs(filter))

  // 1.1 section (see head of the file)
  if (isMixedSortOrder(sortFields, sortOrder)) {
    throw new Error(`TODO`)
  }

  // 1.2 section (see head of the file)
  const eqOrQueries = getEqQueries(dbQueries)
  const filterFields = eqOrQueries.length
    ? [dbQueryToDottedField(eqOrQueries[0])]
    : []

  // 1.3 section (see head of the file)
  const indexFields = buildIndexFields(filterFields, sortFields, sortOrder)

  // Create indexes concurrently to spread the work across query workers
  const promises = nodeTypeNames.map(
    async (typeName): Promise<[string, boolean]> => [
      typeName,
      await createIndex(args, typeName, indexFields),
    ]
  )

  const reverse = sortOrder.length > 0 && sortOrder.every(isDesc)
  // console.log(`reverse?`, reverse)

  // In 99% of cases `nodeTypeNames` contains a single type.
  // It may contain multiple in case of Node interface
  let result = new GatsbyIterable<IGatsbyNode>([])
  for await (const [typeName, canUseIndex] of promises) {
    if (!canUseIndex) throw new Error(`TODO`)
    const { result: matches, usedQueries } = await filterUsingIndex(
      args,
      typeName,
      indexFields,
      dbQueries,
      reverse
    )
    const intermediateResult = matches
      .map(({ value }) => datastore.getNode(value))
      .filter(Boolean) as GatsbyIterable<IGatsbyNode>

    result = result.mergeSorted(
      completeResult(typeName, intermediateResult, dbQueries, usedQueries)
    )
  }
  return result
}

async function runQueryWithoutSort(
  args: IRunQueryArgs
): Promise<GatsbyIterable<IGatsbyNode>> {
  const { nodeTypeNames, queryArgs: { filter } = {}, datastore } = args
  const dbQueries = createDbQueriesFromObject(prepareQueryArgs(filter))
  const queriesToIndex = getQueriesThatCanUseIndex(dbQueries)

  // 2.1 section
  if (queriesToIndex.length) {
    const filterFields = queriesToIndex.map(dbQueryToDottedField)
    const uniqueFilterFields = [...new Set(filterFields)].slice(0, 3)
    const indexFields = buildIndexFields(uniqueFilterFields)

    // console.log(`no sort; indexFields: `, indexFields)

    // Create indexes concurrently to spread the work across query workers
    const promises = nodeTypeNames.map(
      async (typeName): Promise<[string, boolean]> => [
        typeName,
        await createIndex(args, typeName, indexFields),
      ]
    )

    let result = new GatsbyIterable<IGatsbyNode>([])
    for await (const [typeName, canUseIndex] of promises) {
      if (!canUseIndex) throw new Error(`TODO`)
      const { result: matches, usedQueries } = await filterUsingIndex(
        args,
        typeName,
        indexFields,
        dbQueries
      )
      const intermediateResult = matches
        .deduplicateSorted((prev, current) =>
          prev.value === current.value ? 0 : -1
        )
        .map(({ value }) => datastore.getNode(value))
        .filter(Boolean) as GatsbyIterable<IGatsbyNode>

      result = result.concat(
        completeResult(typeName, intermediateResult, dbQueries, usedQueries)
      )
    }
    return result
  }

  // 2.2 section
  // TODO: 2.2.1 try to find existing index and use index data for initial filtering
  // TODO: 2.2.2 iterate nodes by type (do not fall back to fast filters)
  console.warn(`Fallback to full scan :/ ${nodeTypeNames[0]} ${filter}`)
  let result = new GatsbyIterable<IGatsbyNode>([])
  for (const typeName of nodeTypeNames) {
    result = result.concat(
      completeResult(
        typeName,
        datastore.iterateNodesByType(typeName),
        dbQueries,
        new Set()
      )
    )
  }
  return result
}

function completeResult(
  typeName: string,
  intermediateResult: IGatsbyIterable<IGatsbyNode>,
  dbQueries: Array<DbQuery>,
  usedQueries: Set<DbQuery>
): IGatsbyIterable<IGatsbyNode> {
  // Apply remaining filter operations directly (last resort: slow)
  if (usedQueries.size === dbQueries.length) {
    return intermediateResult
  }
  const resolvedNodes = store.getState().resolvedNodesCache.get(typeName)

  const filtersToApply: Array<[string, IDbFilterStatement]> = dbQueries
    .filter(q => !usedQueries.has(q))
    .map(q => [dbQueryToDottedField(q), getFilterStatement(q)])

  // console.log(`have to complete results`, filtersToApply)

  let items = 0
  const start = Date.now()
  let shown = true

  return intermediateResult.filter(node => {
    const resolvedFields = resolvedNodes?.get(node.id)
    for (const [dottedField, filter] of filtersToApply) {
      ++items
      if (items % 1000 === 0) shown = false
      if (!shown) {
        shown = true
        console.log(
          `Completing huge dataset (${items} items so far) for: ${typeName}.${dottedField}; spent: ${
            Date.now() - start
          }ms;`
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

/**
 * Given filter and sort fields (in dotted notation), as well as a sort order,
 * returns an object describing index fields.
 *
 * Example:
 *  buildIndexFields([`foo`], [`foo`, `bar`], [`desc`, `desc`])
 *  // returns:
 *  // { `foo` : -1, `bar`: -1 }
 */
function buildIndexFields(
  filterFields: Array<string>,
  sortFields: Array<string> = [],
  sortOrder: Array<"asc" | "desc" | boolean> = []
): IIndexFields {
  const indexFields = [
    ...filterFields
      .filter(field => !sortFields.includes(field))
      .map(field => [field, 1]),

    ...sortFields.map((fieldName, index) => [
      fieldName,
      isDesc(sortOrder[index]) ? -1 : 1,
    ]),
  ]
  return indexFields.reduce(
    (acc, [field, order]) => Object.assign(acc, { [field]: order }),
    {}
  )
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

function isDesc(
  sortOrder: "asc" | "desc" | "ASC" | "DESC" | boolean | void
): boolean {
  return sortOrder === `desc` || sortOrder === `DESC` || sortOrder === false
}
