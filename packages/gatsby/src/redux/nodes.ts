import { store } from "./"
import { IGatsbyNode } from "./types"
import { createPageDependency } from "./actions/add-page-dependency"
import { IDbQueryElemMatch } from "../db/common/query"
import { getNode, getNodes, getNodesByType } from "../datastore"

// Only list supported ops here. "CacheableFilterOp"
export type FilterOp =  // TODO: merge with DbComparator ?
  | "$eq"
  | "$ne"
  | "$lt"
  | "$lte"
  | "$gt"
  | "$gte"
  | "$in"
  | "$nin"
  | "$regex" // Note: this includes $glob
// Note: `undefined` is an encoding for a property that does not exist
export type FilterValueNullable =  // TODO: merge with DbComparatorValue
  | string
  | number
  | boolean
  | null
  | undefined
  | RegExp // Only valid for $regex
  | Array<string | number | boolean | null | undefined>
// This is filter value in most cases
type FilterValue =
  | string
  | number
  | boolean
  | RegExp // Only valid for $regex
  | Array<string | number | boolean>
export type FilterCacheKey = string
export interface IFilterCache {
  op: FilterOp
  // In this map `undefined` values represent nodes that did not have the path
  // The individual arrays are ordered asc by internal.counter which will
  // preserve insertion order and guarantee uniqueness and it's a number so our
  // .sort() calls can subtract one from the other which is nice :)
  // This arrays may contain duplicates (!) because those only get filtered in the
  // last step.
  // TODO: We might decide to make sure these buckets _are_ deduped for eq perf
  byValue: Map<FilterValueNullable, Array<IGatsbyNode>>
  meta: {
    // Used by ne/nin, which will create a Set from this array and then remove another set(s) and sort
    nodesUnordered?: Array<IGatsbyNode>
    // Flat list of all nodes by requested types, ordered by counter (cached for empty filters)
    orderedByCounter?: Array<IGatsbyNode>
    // Ordered list of all values (by `<`) found by this filter. No null / undefs
    valuesAsc?: Array<FilterValue>
    // Flat list of nodes, ordered by valueAsc
    nodesByValueAsc?: Array<IGatsbyNode>
    // Ranges of nodes per value, maps to the nodesByValueAsc array
    valueRangesAsc?: Map<FilterValue, [number, number]>
    // Ordered list of all values (by `>`) found by this filter. No null / undefs
    valuesDesc?: Array<FilterValue>
    // Flat list of nodes, ordered by valueDesc
    nodesByValueDesc?: Array<IGatsbyNode>
    // Ranges of nodes per value, maps to the nodesByValueDesc array
    valueRangesDesc?: Map<FilterValue, [number, number]>
  }
}
export type FiltersCache = Map<FilterCacheKey, IFilterCache>

/**
 * Determine if node has changed.
 */
export const hasNodeChanged = (id: string, digest: string): boolean => {
  const node = getNode(id)
  if (!node) {
    return true
  } else {
    return node.internal.contentDigest !== digest
  }
}

/**
 * Get node and save path dependency.
 */
export const getNodeAndSavePathDependency = (
  id: string,
  path: string
): IGatsbyNode | undefined => {
  const node = getNode(id)

  if (!node) {
    console.error(
      `getNodeAndSavePathDependency failed for node id: ${id} as it was not found in cache`
    )
    return undefined
  }

  createPageDependency({ path, nodeId: id })
  return node
}

type Resolver = (node: IGatsbyNode) => Promise<any> // TODO

export const saveResolvedNodes = async (
  nodeTypeNames: Array<string>,
  resolver: Resolver
): Promise<void> => {
  for (const typeName of nodeTypeNames) {
    const nodes = getNodesByType(typeName)
    if (!nodes || !nodes.length) continue

    const resolvedNodes = new Map()
    for (const node of nodes) {
      const resolved = await resolver(node)
      resolvedNodes.set(node.id, resolved)
    }
    store.dispatch({
      type: `SET_RESOLVED_NODES`,
      payload: {
        key: typeName,
        nodes: resolvedNodes,
      },
    })
  }
}

/**
 * Get node and save path dependency.
 */
export const getResolvedNode = (
  typeName: string,
  id: string
): IGatsbyNode | null => {
  const { resolvedNodesCache } = store.getState()

  const node = getNode(id)

  if (!node || node.internal.type !== typeName) {
    return null
  }

  const resolvedNodes = resolvedNodesCache.get(typeName)

  if (resolvedNodes) {
    node.__gatsby_resolved = resolvedNodes.get(id)
  }

  return node
}

export function postIndexingMetaSetup(
  filterCache: IFilterCache,
  op: FilterOp
): void {
  // Loop through byValue and make sure the buckets are sorted by counter
  // Since we don't do insertion sort, we have to do it afterwards
  for (const bucket of filterCache.byValue) {
    bucket[1].sort((a, b) => a.internal.counter - b.internal.counter)
  }

  if (op === `$ne` || op === `$nin`) {
    postIndexingMetaSetupNeNin(filterCache)
  } else if ([`$lt`, `$lte`, `$gt`, `$gte`].includes(op)) {
    postIndexingMetaSetupLtLteGtGte(filterCache, op)
  }
}

function postIndexingMetaSetupNeNin(filterCache: IFilterCache): void {
  // Note: edge cases regarding `null` and `undefined`. Here `undefined` signals
  // that the property did not exist as the filters do not support actual
  // `undefined` values.
  // For $ne, `null` only returns nodes that actually have the property
  // and in that case the property cannot be `null` either. For any other value,
  // $ne will return all nodes where the value is not actually the needle,
  // including nodes where the value is null.
  // A $nin does the same as an $ne except it filters multiple values instead
  // of just one.

  // For `$ne` we will take the list of all targeted nodes and eliminate the
  // bucket of nodes with a particular value, if it exists at all..

  const arr: Array<IGatsbyNode> = []
  filterCache.meta.nodesUnordered = arr
  filterCache.byValue.forEach(v => {
    v.forEach(node => {
      arr.push(node)
    })
  })
}

function postIndexingMetaSetupLtLteGtGte(
  filterCache: IFilterCache,
  op: FilterOp
): void {
  // Create an ordered array of individual nodes, ordered (grouped) by the
  // value to which the filter resolves. Nodes per value are ordered by
  // internal.counter, asc.
  // This way non-eq ops can simply slice the array to get a range.

  const entriesNullable: Array<[FilterValueNullable, Array<IGatsbyNode>]> = [
    ...filterCache.byValue.entries(),
  ]

  // These range checks never return `null` or `undefined` so filter those out
  // By filtering them out early, the sort should be faster. Could be ...
  const entries: Array<[
    FilterValue,
    Array<IGatsbyNode>
  ]> = entriesNullable.filter(([v]) => v != null) as Array<
    [FilterValue, Array<IGatsbyNode>]
  >

  // Sort all arrays by its value, asc. Ignore/allow potential type casting.
  // Note: while `<` is the inverse of `>=`, the ordering might coerce values.
  // This coercion makes the op no longer idempotent (normally the result of
  // `a < b` is the opposite of `b >= a` for any a or b of the same type). The
  // exception is a number that is `NaN`, which we're ignoring here as it's most
  // likely a bug in the user code. However, when coercing the ops may end up
  // comparing against `NaN`, too. For example: `("abc" <= 12) !== (12 > "abc")`
  // which ends up doing `NaN <= 12` and `NaN > "abc"`, which will both yield
  // false.
  // So instead we potentially track two ordered lists; ascending and descending
  // and the only difference when comparing the inverse of one to the other
  // should be how these `NaN` cases end up getting ordered.
  // It's fine for `lt` and `lte` to use the same ordered list. Same for gt/gte.
  if (op === `$lt` || op === `$lte`) {
    // Order ascending; first value is lowest
    entries.sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
  } else if (op === `$gt` || op === `$gte`) {
    // Order descending; first value is highest
    entries.sort(([a], [b]) => (a > b ? -1 : a < b ? 1 : 0))
  }

  const orderedNodes: Array<IGatsbyNode> = []
  const orderedValues: Array<FilterValue> = []
  const offsets: Map<FilterValue, [number, number]> = new Map()
  entries.forEach(([v, bucket]: [FilterValue, Array<IGatsbyNode>]) => {
    // Record the range containing all nodes with as filter value v
    // The last value of the range should be the offset of the next value
    // (So you should be able to do `nodes.slice(start, stop)` to get them)
    offsets.set(v, [orderedNodes.length, orderedNodes.length + bucket.length])
    // We could do `arr.push(...bucket)` here but that's not safe with very
    // large sets, so we use a regular loop
    bucket.forEach(node => orderedNodes.push(node))
    orderedValues.push(v)
  })

  if (op === `$lt` || op === `$lte`) {
    filterCache.meta.valuesAsc = orderedValues
    filterCache.meta.nodesByValueAsc = orderedNodes
    // The nodesByValueAsc is ordered by value, but multiple nodes per value are
    // not ordered. To make lt as fast as lte, we must know the start and stop
    // index for each value. Similarly useful for for `ne`.
    filterCache.meta.valueRangesAsc = offsets
  } else if (op === `$gt` || op === `$gte`) {
    filterCache.meta.valuesDesc = orderedValues
    filterCache.meta.nodesByValueDesc = orderedNodes
    // The nodesByValueDesc is ordered by value, but multiple nodes per value are
    // not ordered. To make gt as fast as gte, we must know the start and stop
    // index for each value. Similarly useful for for `ne`.
    filterCache.meta.valueRangesDesc = offsets
  }
}

/**
 * Given a single non-elemMatch filter path, a list of node types, and a
 * cache, create a cache that for each resulting value of the filter contains
 * all the Nodes in a list.
 * This cache is used for applying the filter and is a massive improvement over
 * looping over all the nodes, when the number of pages (/nodes) scales up.
 */
export const ensureIndexByQuery = (
  op: FilterOp,
  filterCacheKey: FilterCacheKey,
  filterPath: Array<string>,
  nodeTypeNames: Array<string>,
  filtersCache: FiltersCache
): void => {
  const state = store.getState()
  const resolvedNodesCache = state.resolvedNodesCache

  const filterCache: IFilterCache = {
    op,
    byValue: new Map<FilterValueNullable, Array<IGatsbyNode>>(),
    meta: {},
  } as IFilterCache
  filtersCache.set(filterCacheKey, filterCache)

  // We cache the subsets of nodes by type, but only one type. So if searching
  // through one node type we can prevent a search through all nodes, otherwise
  // it's probably faster to loop through all nodes. Perhaps. Maybe.

  if (nodeTypeNames.length === 1) {
    getNodesByType(nodeTypeNames[0]).forEach(node => {
      addNodeToFilterCache(node, filterPath, filterCache, resolvedNodesCache)
    })
  } else {
    // Here we must first filter for the node type
    // This loop is expensive at scale (!)
    getNodes().forEach(node => {
      if (!nodeTypeNames.includes(node.internal.type)) {
        return
      }

      addNodeToFilterCache(node, filterPath, filterCache, resolvedNodesCache)
    })
  }

  postIndexingMetaSetup(filterCache, op)
}

export function ensureEmptyFilterCache(
  filterCacheKey,
  nodeTypeNames: Array<string>,
  filtersCache: FiltersCache
): void {
  // This is called for queries without any filters
  // We want to cache the result since it's basically a list of nodes by type(s)
  // There are sites that have multiple queries which are empty

  const state = store.getState()
  const resolvedNodesCache = state.resolvedNodesCache
  const orderedByCounter: Array<IGatsbyNode> = []

  filtersCache.set(filterCacheKey, {
    op: `$eq`, // Ignore.
    byValue: new Map<FilterValueNullable, Array<IGatsbyNode>>(),
    meta: {
      orderedByCounter, // This is what we want
    },
  })

  if (nodeTypeNames.length === 1) {
    getNodesByType(nodeTypeNames[0]).forEach(node => {
      if (!node.__gatsby_resolved) {
        const typeName = node.internal.type
        const resolvedNodes = resolvedNodesCache.get(typeName)
        const resolved = resolvedNodes?.get(node.id)
        if (resolved !== undefined) {
          node.__gatsby_resolved = resolved
        }
      }
      orderedByCounter.push(node)
    })
  } else {
    // Here we must first filter for the node type
    // This loop is expensive at scale (!)
    getNodes().forEach(node => {
      if (nodeTypeNames.includes(node.internal.type)) {
        if (!node.__gatsby_resolved) {
          const typeName = node.internal.type
          const resolvedNodes = resolvedNodesCache.get(typeName)
          const resolved = resolvedNodes?.get(node.id)
          if (resolved !== undefined) {
            node.__gatsby_resolved = resolved
          }
        }
        orderedByCounter.push(node)
      }
    })
  }

  // Since each node can only have one type, we shouldn't have to be concerned
  // about duplicates in this array. Just make sure they're sorted.
  orderedByCounter.sort((a, b) => a.internal.counter - b.internal.counter)
}

function addNodeToFilterCache(
  node: IGatsbyNode,
  chain: Array<string>,
  filterCache: IFilterCache,
  resolvedNodesCache,
  valueOffset: any = node
): void {
  // There can be a filter that targets `__gatsby_resolved` so fix that first
  if (!node.__gatsby_resolved) {
    const typeName = node.internal.type
    const resolvedNodes = resolvedNodesCache.get(typeName)
    node.__gatsby_resolved = resolvedNodes?.get(node.id)
  }

  // - for plain query, valueOffset === node
  // - for elemMatch, valueOffset is sub-tree of the node to continue matching
  let v = valueOffset as any
  let i = 0
  while (i < chain.length && v) {
    const nextProp = chain[i++]
    v = v[nextProp]
  }

  if (
    (typeof v !== `string` &&
      typeof v !== `number` &&
      typeof v !== `boolean` &&
      v !== null) ||
    i !== chain.length
  ) {
    if (i === chain.length && Array.isArray(v)) {
      // The op resolved to an array
      // Add an entry for each element of the array. This would work for ops
      // like eq and ne, but not sure about range ops like lt,lte,gt,gte.

      v.forEach(v => markNodeForValue(filterCache, node, v))

      return
    }

    // This means that either
    // - The filter resolved to `undefined`, or
    // - The filter resolved to something other than a primitive
    // Set the value to `undefined` to mark "path does not (fully) exist"
    v = undefined
  }

  markNodeForValue(filterCache, node, v)
}

function markNodeForValue(
  filterCache: IFilterCache,
  node: IGatsbyNode,
  value: FilterValueNullable
): void {
  let arr = filterCache.byValue.get(value)
  if (!arr) {
    arr = []
    filterCache.byValue.set(value, arr)
  }
  arr.push(node)
}

export const ensureIndexByElemMatch = (
  op: FilterOp,
  filterCacheKey: FilterCacheKey,
  filter: IDbQueryElemMatch,
  nodeTypeNames: Array<string>,
  filtersCache: FiltersCache
): void => {
  // Given an elemMatch filter, generate the cache that contains all nodes that
  // matches a given value for that sub-query

  const state = store.getState()
  const { resolvedNodesCache } = state

  const filterCache: IFilterCache = {
    op,
    byValue: new Map<FilterValueNullable, Array<IGatsbyNode>>(),
    meta: {},
  } as IFilterCache
  filtersCache.set(filterCacheKey, filterCache)

  if (nodeTypeNames.length === 1) {
    getNodesByType(nodeTypeNames[0]).forEach(node => {
      addNodeToBucketWithElemMatch(
        node,
        node,
        filter,
        filterCache,
        resolvedNodesCache
      )
    })
  } else {
    // Expensive at scale
    getNodes().forEach(node => {
      if (!nodeTypeNames.includes(node.internal.type)) {
        return
      }

      addNodeToBucketWithElemMatch(
        node,
        node,
        filter,
        filterCache,
        resolvedNodesCache
      )
    })
  }

  postIndexingMetaSetup(filterCache, op)
}

function addNodeToBucketWithElemMatch(
  node: IGatsbyNode,
  valueAtCurrentStep: any, // Arbitrary step on the path inside the node
  filter: IDbQueryElemMatch,
  filterCache: IFilterCache,
  resolvedNodesCache
): void {
  // There can be a filter that targets `__gatsby_resolved` so fix that first
  if (!node.__gatsby_resolved) {
    const typeName = node.internal.type
    const resolvedNodes = resolvedNodesCache.get(typeName)
    node.__gatsby_resolved = resolvedNodes?.get(node.id)
  }

  const { path, nestedQuery } = filter

  // Find the value to apply elemMatch to
  let i = 0
  while (i < path.length && valueAtCurrentStep) {
    const nextProp = path[i++]
    valueAtCurrentStep = valueAtCurrentStep[nextProp]
  }

  if (path.length !== i) {
    // Found undefined before the end of the path
    return
  }

  // `v` should now be an elemMatch target, probably an array (but maybe not)
  if (!Array.isArray(valueAtCurrentStep)) {
    // It's possible to `elemMatch` on a non-array so let's support that too
    valueAtCurrentStep = [valueAtCurrentStep]
  }

  // Note: We need to check all elements because the node may need to be added
  // to multiple buckets (`{a:[{b:3},{b:4}]}`, for `a.elemMatch.b/eq` that
  // node ends up in buckets for value 3 and 4. This may lead to duplicate
  // work when elements resolve to the same value, but that can't be helped.
  valueAtCurrentStep.forEach(elem => {
    if (nestedQuery.type === `elemMatch`) {
      addNodeToBucketWithElemMatch(
        node,
        elem,
        nestedQuery,
        filterCache,
        resolvedNodesCache
      )
    } else {
      // Now take same route as non-elemMatch filters would take
      addNodeToFilterCache(
        node,
        nestedQuery.path,
        filterCache,
        resolvedNodesCache,
        elem
      )
    }
  })
}

const binarySearchAsc = (
  values: Array<FilterValue>, // Assume ordered asc
  needle: FilterValue
): [number, number] | undefined => {
  let min = 0
  let max = values.length - 1
  let pivot = Math.floor(values.length / 2)
  while (min <= max) {
    const value = values[pivot]
    if (needle < value) {
      // Move pivot to middle of nodes left of current pivot
      // assert pivot < max
      max = pivot
    } else if (needle > value) {
      // Move pivot to middle of nodes right of current pivot
      // assert pivot > min
      min = pivot
    } else {
      // This means needle === value
      // TODO: except for NaN ... and potentially certain type casting cases
      return [pivot, pivot]
    }

    if (max - min <= 1) {
      // End of search. Needle not found (as expected). Use pivot as index.
      // If the needle was not found, max-min==1 and max is returned.
      return [min, max]
    }

    pivot = min + Math.floor((max - min) / 2)
  }

  // Shouldn't be reachable
  return undefined
}
const binarySearchDesc = (
  values: Array<FilterValue>, // Assume ordered desc
  needle: FilterValue
): [number, number] | undefined => {
  let min = 0
  let max = values.length - 1
  let pivot = Math.floor(values.length / 2)
  while (min <= max) {
    const value = values[pivot]
    if (needle < value) {
      // Move pivot to middle of nodes right of current pivot
      // assert pivot < min
      min = pivot
    } else if (needle > value) {
      // Move pivot to middle of nodes left of current pivot
      // assert pivot > max
      max = pivot
    } else {
      // This means needle === value
      // TODO: except for NaN ... and potentially certain type casting cases
      return [pivot, pivot]
    }

    if (max - min <= 1) {
      // End of search. Needle not found (as expected). Use pivot as index.
      // If the needle was not found, max-min==1 and max is returned.
      return [min, max]
    }

    pivot = min + Math.floor((max - min) / 2)
  }

  // Shouldn't be reachable
  return undefined
}

/**
 * Given the cache key for a filter and a target value return the list of nodes
 * that resolve to this value. The returned array should be ordered by id.
 * This returns `undefined` if there is no such node
 *
 * Basically if the filter was {a: {b: {slug: {eq: "foo/bar"}}}} then it will
 * return all the nodes that have `node.slug === "foo/bar"`. That usually (but
 * not always) at most one node for slug, but this filter can apply to anything.
 *
 * Arrays returned by this function must be ordered by internal.counter and
 * not contain duplicate nodes (!)
 */
export const getNodesFromCacheByValue = (
  filterCacheKey: FilterCacheKey,
  filterValue: FilterValueNullable,
  filtersCache: FiltersCache,
  wasElemMatch
): Array<IGatsbyNode> | undefined => {
  const filterCache = filtersCache.get(filterCacheKey)
  if (!filterCache) {
    return undefined
  }

  const op = filterCache.op

  if (op === `$eq`) {
    // Arrays in byValue are assumed to be ordered by counter

    if (filterValue == null) {
      // Edge case for null; fetch all nodes for `null` and `undefined` because
      // `$eq` also returns nodes without the path when searching for `null`.
      // Not all ops do so, so we map non-existing paths to `undefined`.

      const arrNull = filterCache.byValue.get(null) ?? []
      const arrUndef = filterCache.byValue.get(undefined) ?? []

      // Merge the two (ordered) arrays and return an ordered deduped array
      // TODO: is there a reason left why we cant just cache this merged list?
      return unionNodesByCounter(arrNull, arrUndef)
    }

    return filterCache.byValue.get(filterValue)
  }

  if (op === `$in`) {
    if (!Array.isArray(filterValue)) {
      throw new Error("The argument to the `in` comparator should be an array")
    }
    const filterValueArr: Array<FilterValueNullable> = filterValue

    const set: Set<IGatsbyNode> = new Set()

    // TODO: we can also mergeSort for every step. this may perform worse because of how memory in js works.
    // For every value in the needle array, find the bucket of nodes for
    // that value, add this bucket of nodes to one list, return the list.
    filterValueArr.forEach((v: FilterValueNullable) =>
      filterCache.byValue.get(v)?.forEach(v => set.add(v))
    )

    const arr = [...set] // this is bad for perf but will guarantee us a unique set :(
    arr.sort((A, B) => A.internal.counter - B.internal.counter)

    // Note: it's very unlikely that the list of filter values is big so .includes should be fine here
    if (filterValueArr.includes(null)) {
      // Like all other ops, `in: [null]` behaves weirdly, allowing all nodes
      // that do not actually have a (complete) path (v=undefined)
      const nodes = filterCache.byValue.get(undefined)
      if (nodes) {
        // This will also dedupe so don't do that immediately
        return unionNodesByCounter(nodes, arr)
      }
    }

    // elemMatch can cause a node to appear in multiple buckets so we must dedupe first
    if (wasElemMatch) {
      expensiveDedupeInline(arr)
    }

    return arr
  }

  if (op === `$nin`) {
    // This is essentially the same as the $ne operator, just with multiple
    // values to exclude.

    if (!Array.isArray(filterValue)) {
      throw new Error(`The $nin operator expects an array as value`)
    }

    const values: Set<FilterValueNullable> = new Set(filterValue)
    const set = new Set(filterCache.meta.nodesUnordered)

    // Do the action for "$ne" for each element in the set of values
    values.forEach(filterValue => {
      removeBucketFromSet(filterValue, filterCache, set)
    })

    // TODO: there's probably a more efficient algorithm to do set
    //       subtraction in such a way that we don't have to re-sort
    return [...set].sort((A, B) => A.internal.counter - B.internal.counter)
  }

  if (op === `$ne`) {
    const set = new Set(filterCache.meta.nodesUnordered)

    removeBucketFromSet(filterValue, filterCache, set)

    // TODO: there's probably a more efficient algorithm to do set
    //       subtraction in such a way that we don't have to resort here
    return [...set].sort((A, B) => A.internal.counter - B.internal.counter)
  }

  if (op === `$regex`) {
    // Note: $glob is converted to $regex so $glob filters go through here, too
    // Aside from the input pattern format, further behavior is exactly the same.

    // The input to the filter must be a string (including leading/trailing slash and regex flags)
    // By the time the filter reaches this point, the filterValue has to be a regex.

    if (!(filterValue instanceof RegExp)) {
      throw new Error(
        `The value for the $regex comparator must be an instance of RegExp`
      )
    }
    const regex = filterValue

    const arr: Array<IGatsbyNode> = []
    filterCache.byValue.forEach((nodes, value) => {
      // TODO: does the value have to be a string for $regex? Can we auto-ignore any non-strings? Or does it coerce.
      // Note: for legacy reasons partial paths should also be included for regex
      if (value !== undefined && regex.test(String(value))) {
        nodes.forEach(node => arr.push(node))
      }
    })

    // TODO: we _can_ cache this list as well. Might make sense if it turns out that $regex is mostly used with literals
    // TODO: it may make sense to first collect all buckets and then to .concat them, or merge sort them

    arr.sort((A, B) => A.internal.counter - B.internal.counter)

    // elemMatch can cause a node to appear in multiple buckets so we must dedupe
    if (wasElemMatch) {
      expensiveDedupeInline(arr)
    }

    return arr
  }

  if (filterValue == null) {
    if (op === `$lt` || op === `$gt`) {
      // Nothing is lt/gt null
      return undefined
    }

    // This is an edge case and this value should be directly indexed
    // For `lte`/`gte` this should only return nodes for `null`, not a "range"
    return filterCache.byValue.get(filterValue)
  }

  if (Array.isArray(filterValue)) {
    throw new Error(
      "Array is an invalid filter value for the `" + op + "` comparator"
    )
  }

  if (filterValue instanceof RegExp) {
    // This is most likely an internal error, although it is possible for
    // users to talk to this API more directly.
    throw new Error(
      `A RegExp instance is only valid for $regex and $glob comparators`
    )
  }

  if (op === `$lt`) {
    // First try a direct approach. If a value is queried that also exists then
    // we can prevent a binary search through the whole list, O(1) vs O(log n)

    const ranges = filterCache.meta.valueRangesAsc
    const nodes = filterCache.meta.nodesByValueAsc

    const range = ranges!.get(filterValue)
    if (range) {
      const arr = nodes!.slice(0, range[0])
      arr.sort((A, B) => A.internal.counter - B.internal.counter)
      // elemMatch can cause a node to appear in multiple buckets so we must dedupe
      if (wasElemMatch) {
        expensiveDedupeInline(arr)
      }
      return arr
    }

    // Query may ask for a value that doesn't appear in the list, like if the
    // list is [1, 2, 5, 6] and the query is <= 3. In that case we have to
    // apply a search (we'll do binary) to determine the offset to slice from.

    // Note: for lte, the valueAsc array must be list at this point
    const values = filterCache.meta.valuesAsc as Array<FilterValue>
    // It shouldn't find the targetValue (but it might) and return the index of
    // the two value between which targetValue sits, or first/last element.
    const point = binarySearchAsc(values, filterValue)
    if (!point) {
      return undefined
    }
    const [pivotMin, pivotMax] = point

    // Each pivot index must have a value and a range
    // The returned min/max index may include the lower/upper bound, so we still
    // have to do lte checks for both values.
    let pivotValue = values[pivotMax]
    if (pivotValue > filterValue) {
      pivotValue = values[pivotMin]
    }

    // Note: the pivot value _shouldnt_ match the filter value because that
    // means the value was actually found, but those should have been indexed
    // so should have yielded a result in the .get() above.

    const [exclPivot, inclPivot] = ranges!.get(pivotValue) as [number, number]

    // Note: technically, `5 <= "5" === true` but `5` would not be cached.
    // So we have to consider weak comparison and may have to include the pivot
    const until = pivotValue < filterValue ? inclPivot : exclPivot
    const arr = nodes!.slice(0, until)
    arr.sort((A, B) => A.internal.counter - B.internal.counter)
    // elemMatch can cause a node to appear in multiple buckets so we must dedupe
    if (wasElemMatch) {
      expensiveDedupeInline(arr)
    }
    return arr
  }

  if (op === `$lte`) {
    // First try a direct approach. If a value is queried that also exists then
    // we can prevent a binary search through the whole list, O(1) vs O(log n)

    const ranges = filterCache.meta.valueRangesAsc
    const nodes = filterCache.meta.nodesByValueAsc

    const range = ranges!.get(filterValue)
    if (range) {
      const arr = nodes!.slice(0, range[1])
      arr.sort((A, B) => A.internal.counter - B.internal.counter)
      // elemMatch can cause a node to appear in multiple buckets so we must dedupe
      if (wasElemMatch) {
        expensiveDedupeInline(arr)
      }
      return arr
    }

    // Query may ask for a value that doesn't appear in the list, like if the
    // list is [1, 2, 5, 6] and the query is <= 3. In that case we have to
    // apply a search (we'll do binary) to determine the offset to slice from.

    // Note: for lte, the valueAsc array must be list at this point
    const values = filterCache.meta.valuesAsc as Array<FilterValue>
    // It shouldn't find the targetValue (but it might) and return the index of
    // the two value between which targetValue sits, or first/last element.
    const point = binarySearchAsc(values, filterValue)
    if (!point) {
      return undefined
    }
    const [pivotMin, pivotMax] = point

    // Each pivot index must have a value and a range
    // The returned min/max index may include the lower/upper bound, so we still
    // have to do lte checks for both values.
    let pivotValue = values[pivotMax]
    if (pivotValue > filterValue) {
      pivotValue = values[pivotMin]
    }

    // Note: the pivot value _shouldnt_ match the filter value because that
    // means the value was actually found, but those should have been indexed
    // so should have yielded a result in the .get() above.

    const [exclPivot, inclPivot] = ranges!.get(pivotValue) as [number, number]

    // Note: technically, `5 <= "5" === true` but `5` would not be cached.
    // So we have to consider weak comparison and may have to include the pivot
    const until = pivotValue <= filterValue ? inclPivot : exclPivot
    const arr = nodes!.slice(0, until)
    arr.sort((A, B) => A.internal.counter - B.internal.counter)
    // elemMatch can cause a node to appear in multiple buckets so we must dedupe
    if (wasElemMatch) {
      expensiveDedupeInline(arr)
    }
    return arr
  }

  if (op === `$gt`) {
    // First try a direct approach. If a value is queried that also exists then
    // we can prevent a binary search through the whole list, O(1) vs O(log n)

    const ranges = filterCache.meta.valueRangesDesc
    const nodes = filterCache.meta.nodesByValueDesc

    const range = ranges!.get(filterValue)
    if (range) {
      const arr = nodes!.slice(0, range[0]).reverse()
      arr.sort((A, B) => A.internal.counter - B.internal.counter)
      // elemMatch can cause a node to appear in multiple buckets so we must dedupe
      if (wasElemMatch) {
        expensiveDedupeInline(arr)
      }
      return arr
    }

    // Query may ask for a value that doesn't appear in the list, like if the
    // list is [1, 2, 5, 6] and the query is <= 3. In that case we have to
    // apply a search (we'll do binary) to determine the offset to slice from.

    // Note: for gte, the valueDesc array must be list at this point
    const values = filterCache.meta.valuesDesc as Array<FilterValue>
    // It shouldn't find the targetValue (but it might) and return the index of
    // the two value between which targetValue sits, or first/last element.
    const point = binarySearchDesc(values, filterValue)
    if (!point) {
      return undefined
    }
    const [pivotMin, pivotMax] = point

    // Each pivot index must have a value and a range
    // The returned min/max index may include the lower/upper bound, so we still
    // have to do gte checks for both values.
    let pivotValue = values[pivotMax]
    if (pivotValue < filterValue) {
      pivotValue = values[pivotMin]
    }

    // Note: the pivot value _shouldnt_ match the filter value because that
    // means the value was actually found, but those should have been indexed
    // so should have yielded a result in the .get() above.

    const [exclPivot, inclPivot] = ranges!.get(pivotValue) as [number, number]

    // Note: technically, `5 >= "5" === true` but `5` would not be cached.
    // So we have to consider weak comparison and may have to include the pivot
    const until = pivotValue > filterValue ? inclPivot : exclPivot
    const arr = nodes!.slice(0, until).reverse()
    arr.sort((A, B) => A.internal.counter - B.internal.counter)
    // elemMatch can cause a node to appear in multiple buckets so we must dedupe
    if (wasElemMatch) {
      expensiveDedupeInline(arr)
    }
    return arr
  }

  if (op === `$gte`) {
    // First try a direct approach. If a value is queried that also exists then
    // we can prevent a binary search through the whole list, O(1) vs O(log n)

    const ranges = filterCache.meta.valueRangesDesc
    const nodes = filterCache.meta.nodesByValueDesc

    const range = ranges!.get(filterValue)
    if (range) {
      const arr = nodes!.slice(0, range[1]).reverse()
      arr.sort((A, B) => A.internal.counter - B.internal.counter)
      // elemMatch can cause a node to appear in multiple buckets so we must dedupe
      if (wasElemMatch) {
        expensiveDedupeInline(arr)
      }
      return arr
    }

    // Query may ask for a value that doesn't appear in the list, like if the
    // list is [1, 2, 5, 6] and the query is <= 3. In that case we have to
    // apply a search (we'll do binary) to determine the offset to slice from.

    // Note: for gte, the valueDesc array must be list at this point
    const values = filterCache.meta.valuesDesc as Array<FilterValue>
    // It shouldn't find the targetValue (but it might) and return the index of
    // the two value between which targetValue sits, or first/last element.
    const point = binarySearchDesc(values, filterValue)
    if (!point) {
      return undefined
    }
    const [pivotMin, pivotMax] = point

    // Each pivot index must have a value and a range
    // The returned min/max index may include the lower/upper bound, so we still
    // have to do gte checks for both values.
    let pivotValue = values[pivotMax]
    if (pivotValue < filterValue) {
      pivotValue = values[pivotMin]
    }

    // Note: the pivot value _shouldnt_ match the filter value because that
    // means the value was actually found, but those should have been indexed
    // so should have yielded a result in the .get() above.

    const [exclPivot, inclPivot] = ranges!.get(pivotValue) as [number, number]

    // Note: technically, `5 >= "5" === true` but `5` would not be cached.
    // So we have to consider weak comparison and may have to include the pivot
    const until = pivotValue >= filterValue ? inclPivot : exclPivot
    const arr = nodes!.slice(0, until).reverse()
    arr.sort((A, B) => A.internal.counter - B.internal.counter)
    // elemMatch can cause a node to appear in multiple buckets so we must dedupe
    if (wasElemMatch) {
      expensiveDedupeInline(arr)
    }
    return arr
  }

  // Unreachable because we checked all values of FilterOp (which op is)
  return undefined
}

function removeBucketFromSet(
  filterValue: FilterValueNullable,
  filterCache: IFilterCache,
  set: Set<IGatsbyNode>
): void {
  if (filterValue === null) {
    // Edge case: $ne with `null` returns only the nodes that contain the full
    // path and that don't resolve to null, so drop `undefined` as well.
    let cache = filterCache.byValue.get(undefined)
    if (cache) cache.forEach(node => set.delete(node))
    cache = filterCache.byValue.get(null)
    if (cache) cache.forEach(node => set.delete(node))
  } else {
    // Not excluding null so it should include undefined leafs or leafs where
    // only the partial path exists for whatever reason.
    const cache = filterCache.byValue.get(filterValue)
    if (cache) cache.forEach(node => set.delete(node))
  }
}

/**
 * Finds the intersection of two arrays in O(n) with n = min(a.length, b.length)
 * The returned set should not contain duplicate nodes.
 *
 * The input should be ordered by node.internal.counter and it will return a
 * list that is also ordered by node.internal.counter
 */
export function intersectNodesByCounter(
  a: Array<IGatsbyNode>,
  b: Array<IGatsbyNode>
): Array<IGatsbyNode> {
  let pointerA = 0
  let pointerB = 0
  // TODO: perf check: is it helpful to init the array to min(maxA,maxB) items?
  const result: Array<IGatsbyNode> = []
  const maxA = a.length
  const maxB = b.length
  let lastAdded: IGatsbyNode | undefined = undefined // Used to dedupe the list

  while (pointerA < maxA && pointerB < maxB) {
    const nodeA = a[pointerA]
    const nodeB = b[pointerB]
    const counterA = nodeA.internal.counter
    const counterB = nodeB.internal.counter

    if (counterA < counterB) {
      pointerA++
    } else if (counterA > counterB) {
      pointerB++
    } else {
      if (nodeA !== nodeB) {
        throw new Error(
          `Invariant violation: inconsistent node counters detected`
        )
      }
      // nodeA===nodeB. Make sure we didn't just add this node already.
      // Since input arrays are sorted, the same node should be grouped
      // back to back, so even if both input arrays contained the same node
      // twice, this check would prevent the result from getting duplicate nodes
      if (lastAdded !== nodeA) {
        result.push(nodeA)
        lastAdded = nodeA
      }
      pointerA++
      pointerB++
    }
  }

  return result
}

/**
 * Merge two lists of nodes.
 * The returned set should not contain duplicate nodes.
 *
 * The input should be ordered by node.internal.counter and it will return a
 * list that is also ordered by node.internal.counter
 */
export function unionNodesByCounter(
  a: Array<IGatsbyNode>,
  b: Array<IGatsbyNode>
): Array<IGatsbyNode> {
  // TODO: perf check: is it helpful to init the array to max(maxA,maxB) items?
  const arr: Array<IGatsbyNode> = []
  let lastAdded: IGatsbyNode | undefined = undefined // Used to dedupe the list

  let pointerA = 0
  let pointerB = 0
  const maxA = a.length
  const maxB = b.length

  while (pointerA < maxA && pointerB < maxB) {
    const nodeA = a[pointerA]
    const nodeB = b[pointerB]
    const counterA = nodeA.internal.counter
    const counterB = nodeB.internal.counter

    if (counterA < counterB) {
      if (lastAdded !== nodeA) {
        arr.push(nodeA)
        lastAdded = nodeA
      }
      pointerA++
    } else if (counterA > counterB) {
      if (lastAdded !== nodeB) {
        arr.push(nodeB)
        lastAdded = nodeB
      }
      pointerB++
    } else {
      if (lastAdded !== nodeA) {
        arr.push(nodeA)
        lastAdded = nodeA
      }
      pointerA++
      pointerB++
    }
  }

  while (pointerA < maxA) {
    const nodeA = a[pointerA]
    if (lastAdded !== nodeA) {
      arr.push(nodeA)
      lastAdded = nodeA
    }
    pointerA++
  }

  while (pointerB < maxB) {
    const nodeB = b[pointerB]
    if (lastAdded !== nodeB) {
      arr.push(nodeB)
      lastAdded = nodeB
    }
    pointerB++
  }

  return arr
}

function expensiveDedupeInline(arr: Array<IGatsbyNode>): void {
  // An elemMatch filter may cause duplicates to appear in a bucket.
  // Since the bucket is sorted those should now be back to back
  // Worst case this is a fast O(n) loop that does nothing.
  let prev: IGatsbyNode | undefined = undefined

  // We copy-on-find because a splice is expensive and we can't use Sets

  let j = 0
  for (let i = 0; i < arr.length; ++i) {
    const node = arr[i]
    if (node !== prev) {
      // Only start copying the remainder of the list once a dupe is found
      if (i !== j) {
        arr[j] = node
      }
      ++j
      prev = node
    }
  }
  arr.length = j
}
