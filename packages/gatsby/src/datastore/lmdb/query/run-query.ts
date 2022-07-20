import {
  IDataStore,
  ILmdbDatabases,
  IQueryResult,
  IRunQueryArgs,
} from "../../types"
import { IGatsbyNode } from "../../../redux/types"
import { GatsbyIterable } from "../../common/iterable"
import {
  createDbQueriesFromObject,
  DbQuery,
  dbQueryToDottedField,
  getFilterStatement,
  IDbFilterStatement,
  prepareQueryArgs,
} from "../../common/query"
import {
  createIndex,
  getIndexMetadata,
  IIndexMetadata,
  IndexFields,
} from "./create-index"
import {
  countUsingIndexOnly,
  filterUsingIndex,
  IIndexEntry,
} from "./filter-using-index"
import { store } from "../../../redux"
import { isDesc, resolveFieldValue, matchesFilter, compareKey } from "./common"
import { suggestIndex } from "./suggest-index"

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
  totalCount?: number
}

export async function doRunQuery(args: IDoRunQueryArgs): Promise<IQueryResult> {
  // Note: Keeping doRunQuery method the only async method in chain for perf
  const context = createQueryContext(args)

  const totalCount = async (): Promise<number> =>
    runCountOnce({ ...context, limit: undefined, skip: 0 })

  if (canUseIndex(context)) {
    await Promise.all(
      context.nodeTypeNames.map(typeName =>
        createIndex(context, typeName, context.suggestedIndexFields)
      )
    )
    return { entries: performIndexScan(context), totalCount }
  }
  return { entries: performFullTableScan(context), totalCount }
}

function performIndexScan(context: IQueryContext): GatsbyIterable<IGatsbyNode> {
  const { suggestedIndexFields, sortFields } = context

  const filterContext =
    context.nodeTypeNames.length === 1
      ? context
      : {
          ...context,
          skip: 0,
          limit:
            typeof context.limit === `undefined`
              ? undefined
              : context.skip + context.limit,
        }

  let result = new GatsbyIterable<IGatsbyNode>([])
  let resultOffset = filterContext.skip
  for (const typeName of context.nodeTypeNames) {
    const indexMetadata = getIndexMetadata(
      context,
      typeName,
      suggestedIndexFields
    )
    if (!needsSorting(context)) {
      const { nodes, usedSkip } = filterNodes(filterContext, indexMetadata)
      result = result.concat(nodes)
      resultOffset = usedSkip
      continue
    }
    if (canUseIndexForSorting(indexMetadata, sortFields)) {
      const { nodes, usedSkip } = filterNodes(filterContext, indexMetadata)
      // Interleave nodes of different types (not expensive for already sorted chunks)
      result = result.mergeSorted(nodes, createNodeSortComparator(sortFields))
      resultOffset = usedSkip
      continue
    }
    // The sad part - unlimited filter + in-memory sort
    const unlimited = { ...context, skip: 0, limit: undefined }
    const { nodes, usedSkip } = filterNodes(unlimited, indexMetadata)
    const sortedNodes = sortNodesInMemory(context, nodes)
    resultOffset = usedSkip

    result = result.mergeSorted(
      sortedNodes,
      createNodeSortComparator(sortFields)
    )
  }
  const { limit, skip = 0 } = context
  const actualSkip = skip - resultOffset

  if (limit || actualSkip) {
    result = result.slice(actualSkip, limit ? actualSkip + limit : undefined)
  }
  return result
}

function runCountOnce(context: IQueryContext): number {
  if (typeof context.totalCount === `undefined`) {
    context.totalCount = runCount(context)
  }
  return context.totalCount
}

function runCount(context: IQueryContext): number {
  let count = 0

  if (!needsFiltering(context)) {
    for (const typeName of context.nodeTypeNames) {
      count += context.datastore.countNodes(typeName)
    }
    return count
  }

  if (!canUseIndex(context)) {
    for (const typeName of context.nodeTypeNames) {
      const nodes = completeFiltering(
        context,
        new GatsbyIterable(context.datastore.iterateNodesByType(typeName))
      )
      for (const _ of nodes) count++
    }
    return count
  }

  for (const typeName of context.nodeTypeNames) {
    const indexMetadata = getIndexMetadata(
      context,
      typeName,
      context.suggestedIndexFields
    )
    try {
      count += countUsingIndexOnly({ ...context, indexMetadata })
    } catch (e) {
      // We cannot reliably count using index - fallback to full iteration :/
      for (const _ of filterNodes(context, indexMetadata).nodes) count++
    }
  }
  return count
}

function performFullTableScan(
  context: IQueryContext
): GatsbyIterable<IGatsbyNode> {
  // console.warn(`Fallback to full table scan :/`)

  const { datastore, nodeTypeNames } = context

  let result = new GatsbyIterable<IGatsbyNode>([])
  for (const typeName of nodeTypeNames) {
    let nodes = new GatsbyIterable(datastore.iterateNodesByType(typeName))
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

function filterNodes(
  context: IQueryContext,
  indexMetadata: IIndexMetadata
): { nodes: GatsbyIterable<IGatsbyNode>; usedSkip: number } {
  const { entries, usedQueries, usedSkip } = filterUsingIndex({
    ...context,
    indexMetadata,
    reverse: Array.from(context.sortFields.values())[0] === -1,
  })
  const nodes = entries
    .map(({ value }) => context.datastore.getNode(value))
    .filter(Boolean)

  return {
    nodes: completeFiltering(
      context,
      nodes as GatsbyIterable<IGatsbyNode>,
      usedQueries
    ),
    usedSkip,
  }
}

/**
 * Takes intermediate result and applies any remaining filterQueries.
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

  return intermediateResult.filter(node => {
    const resolvedFields = resolvedNodes?.get(node.internal.type)?.get(node.id)

    for (const [dottedField, filter] of filtersToApply) {
      const tmp = resolveFieldValue(dottedField, node, resolvedFields)
      const value = Array.isArray(tmp) ? tmp : [tmp]
      if (value.some(v => !matchesFilter(filter, v))) {
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
  // TODO: Sort using index data whenever possible (maybe store data needed for sorting in index values)
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

function needsFiltering(context: IQueryContext): boolean {
  return context.dbQueries.length > 0
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
