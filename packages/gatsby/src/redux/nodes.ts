import { store } from "./"
import { IGatsbyNode } from "./types"
import { createPageDependency } from "./actions/add-page-dependency"
import { DbQuery, IDbQueryElemMatch } from "../db/common/query"

/**
 * Get all nodes from redux store.
 */
export const getNodes = (): IGatsbyNode[] => {
  const nodes = store.getState().nodes
  if (nodes) {
    return Array.from(nodes.values())
  } else {
    return []
  }
}

/**
 * Get node by id from store.
 */
export const getNode = (id: string): IGatsbyNode | undefined =>
  store.getState().nodes.get(id)

/**
 * Get all nodes of type from redux store.
 */
export const getNodesByType = (type: string): IGatsbyNode[] => {
  const nodes = store.getState().nodesByType.get(type)
  if (nodes) {
    return Array.from(nodes.values())
  } else {
    return []
  }
}

/**
 * Get all type names from redux store.
 */
export const getTypes = (): string[] =>
  Array.from(store.getState().nodesByType.keys())

/**
 * Determine if node has changed.
 */
export const hasNodeChanged = (id: string, digest: string): boolean => {
  const node = store.getState().nodes.get(id)
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
  nodeTypeNames: string[],
  resolver: Resolver
): Promise<void> => {
  for (const typeName of nodeTypeNames) {
    const nodes = store.getState().nodesByType.get(typeName)
    if (!nodes) return

    const resolvedNodes = new Map()
    for (const node of nodes.values()) {
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
  const { nodesByType, resolvedNodesCache } = store.getState()
  const nodes = nodesByType.get(typeName)

  if (!nodes) {
    return null
  }

  const node = nodes.get(id)

  if (!node) {
    return null
  }

  const resolvedNodes = resolvedNodesCache.get(typeName)

  if (resolvedNodes) {
    node.__gatsby_resolved = resolvedNodes.get(id)
  }

  return node
}

export const addResolvedNodes = (
  typeName: string,
  resolvedNodes: IGatsbyNode[] = []
): IGatsbyNode[] => {
  const { nodesByType, resolvedNodesCache } = store.getState()
  const nodes = nodesByType.get(typeName)

  if (!nodes) {
    return []
  }

  const resolvedNodesFromCache = resolvedNodesCache.get(typeName)

  nodes.forEach(node => {
    if (resolvedNodesFromCache) {
      node.__gatsby_resolved = resolvedNodesFromCache.get(node.id)
    }
    resolvedNodes.push(node)
  })

  return resolvedNodes
}

/**
 * Given a ("flat") filter path leading up to "eq", a set of node types, and a
 * cache, create a cache that for each resulting value of the filter contains
 * all the Nodes in a Set (or, if the property is `id`, just the Nodes).
 * This cache is used for applying the filter and is a massive improvement over
 * looping over all the nodes, when the number of pages (/nodes) scale up.
 */
export const ensureIndexByTypedChain = (
  typedKey: string,
  chain: string[],
  comparator: string, // $eq, $lte, etc
  nodeTypeNames: string[],
  filterCache: Map<
    string,
    {
      buckets: Map<string | number | boolean, Set<IGatsbyNode>>
      opCache: {
        minValue?: string | number | boolean
        maxValue?: string | number | boolean
        nodesOrderedByValue?: Array<IGatsbyNode>
        valueToIndexOffset?: Map<string | number | boolean, [number, number]>
      }
    }
  >
): void => {
  if (filterCache.has(typedKey)) {
    return
  }

  const state = store.getState()
  const { resolvedNodesCache } = state

  // We cache the subsets of nodes by type, but only one type. So if searching
  // through one node type we can prevent a search through all nodes, otherwise
  // it's probably faster to loop through all nodes. Perhaps. Maybe.
  // TODO: is the cast to Set actually an improvement?
  const nodes =
    // nodeTypeNames.length === 1
    //   ? new Set(getNodesByType(nodeTypeNames[0]))
    //   :
    state.nodes

  const byKeyValue: {
    buckets: Map<string | number | boolean, Set<IGatsbyNode>>
    opCache: {
      minValue?: string | number | boolean
      maxValue?: string | number | boolean
      nodesOrderedByValue?: Array<IGatsbyNode>
      valueToIndexOffset?: Map<string | number | boolean, [number, number]>
    }
  } = {
    buckets: new Map<string | number | boolean, Set<IGatsbyNode>>(),
    opCache: {},
  }
  filterCache.set(typedKey, byKeyValue)

  nodes.forEach(node => {
    if (!nodeTypeNames.includes(node.internal.type)) {
      return
    }

    // There can be a filter that targets `__gatsby_resolved` so fix that first
    if (!node.__gatsby_resolved) {
      const typeName = node.internal.type
      const resolvedNodes = resolvedNodesCache.get(typeName)
      node.__gatsby_resolved = resolvedNodes?.get(node.id)
    }

    let v = node as any
    let i = 0
    while (i < chain.length && v) {
      const nextProp = chain[i++]
      v = v[nextProp]
    }

    if (
      (typeof v !== `string` &&
        typeof v !== `number` &&
        // v != null &&
        typeof v !== `boolean`) ||
      i !== chain.length
    ) {
      // Not sure whether this is supposed to happen, but this means that either
      // - The node chain ended with `undefined`, or
      // - The node chain ended in something other than a primitive, or
      // - A part in the chain in the object was not an object
      return
    }

    let set = byKeyValue.buckets.get(v)
    if (!set) {
      set = new Set()
      byKeyValue.buckets.set(v, set)
    }
    set.add(node)
  })

  if (
    // y
    comparator === "$lte" ||
    // x
    comparator === "$gte"
  ) {
    global.shit("   - post-processing " + comparator)
    const entries = [...byKeyValue.buckets.entries()] // Iterator<v, set>
    entries.sort(([a], [b]) => (a <= b ? -1 : a > b ? 1 : 0))
    const arr: Array<IGatsbyNode> = []
    const offsets = new Map()
    entries.forEach(([v, bucket]) => {
      // Record the first index containing node with as filter value v
      offsets.set(v, [arr.length, bucket.size])
      // We could do `arr.push(...bucket)` here but that's not safe with very
      // large sets, so we use a regular loop
      bucket.forEach(node => arr.push(node))
    })

    byKeyValue.opCache.minValue = entries[0]
    byKeyValue.opCache.maxValue = entries[entries.length - 1]
    byKeyValue.opCache.nodesOrderedByValue = arr
    byKeyValue.opCache.valueToIndexOffset = offsets
  }
}

export const ensureIndexByElemMatch = (
  typedKey: string,
  filter: IDbQueryElemMatch,
  nodeTypeNames: string[],
  filterCache: Map<
    string,
    {
      buckets: Map<string | number | boolean, Set<IGatsbyNode>>
      opCache: {
        minValue?: string | number | boolean
        maxValue?: string | number | boolean
        nodesOrderedByValue?: Array<IGatsbyNode>
        valueToIndexOffset?: Map<string | number | boolean, [number, number]>
      }
    }
  >
) => {
  // Given an elemMatch filter, generate the cache that contains all nodes that
  // matches a given value for that sub-query

  if (filterCache.has(typedKey)) {
    return
  }

  const { type, path: leadingPath, nestedQuery } = filter

  const state = store.getState()
  const { resolvedNodesCache } = state

  // Note: both return an iterable object with .forEach and a collection of IGatsbyNode
  const nodes =
    nodeTypeNames.length === 1 ? getNodesByType(nodeTypeNames[0]) : state.nodes

  const byKeyValue: {
    buckets: Map<string | number | boolean, Set<IGatsbyNode>>
    opCache: {
      minValue?: string | number | boolean
      maxValue?: string | number | boolean
      nodesOrderedByValue?: Array<IGatsbyNode>
      valueToIndexOffset?: Map<string | number | boolean, [number, number]>
    }
  } = {
    buckets: new Map<string | number | boolean, Set<IGatsbyNode>>(),
    opCache: {},
  }
  filterCache.set(typedKey, byKeyValue)

  let n = 0
  nodes.forEach(node => {
    if (!nodeTypeNames.includes(node.internal.type)) {
      return
    }

    // There can be a filter that targets `__gatsby_resolved` so fix that first
    if (!node.__gatsby_resolved) {
      const typeName = node.internal.type
      const resolvedNodes = resolvedNodesCache.get(typeName)
      node.__gatsby_resolved = resolvedNodes?.get(node.id)
    }

    ensureIndexByElemMatchOneNode(
      type,
      node,
      leadingPath,
      nestedQuery,
      byKeyValue
    )
  })
}

const ensureIndexByElemMatchOneNode = (
  type: "query" | "elemMatch",
  node: IGatsbyNode,
  outerPath: Array<string>,
  nestedQuery: DbQuery | undefined,
  byKeyValue: {
    buckets: Map<string | number | boolean, Set<IGatsbyNode>>
    opCache: {
      minValue?: string | number | boolean
      maxValue?: string | number | boolean
      nodesOrderedByValue?: Array<IGatsbyNode>
      valueToIndexOffset?: Map<string | number | boolean, [number, number]>
    }
  }
): boolean => {

  // Find the value to apply elemMatch to
  let v = node as any
  let i = 0
  while (i < outerPath.length && v) {
    const nextProp = outerPath[i++]
    v = v[nextProp]
  }

  // `v` should now be an elemMatch target, probably an array (but maybe not)
  if (type === "elemMatch") {
    if (Array.isArray(v)) {
      // Note: we only need one match, so bail on the first match
      let r = v.some((_, i) => {
        return ensureIndexByElemMatchOneNode(
          nestedQuery.type,
          node,
          outerPath.concat([String(i)], nestedQuery.path),
          nestedQuery.nestedQuery,
          byKeyValue
        )
      })
      return r
    } else {
      // Consider this a miss. It's possible to query for values that do not exist
      return false
    }
  } else {
    // not elematch: end
    if (
      (typeof v !== `string` &&
        typeof v !== `number` &&
        // v != null &&
        typeof v !== `boolean`) ||
      i !== outerPath.length
    ) {
      // Not sure whether this is supposed to happen, but this means that either
      // - The node chain ended with `undefined`, or
      // - The node chain ended in something other than a primitive, or
      // - A part in the chain in the object was not an object
      return false
    }

    // Add this node to the value for this elemMatch query
    let set = byKeyValue.buckets.get(v)
    if (!set) {
      set = new Set()
      byKeyValue.buckets.set(v, set)
    }
    set.add(node)
    return true
  }
  return false
}

/**
 * Given a ("flat") filter path leading up to "eq", a target value to filter
 * for, a set of node types, and a pre-generated lookup cache, return the set
 * of Nodes (or, if the property is `id` just the Node) which pass the filter.
 * This returns `undefined` if there is Node that passes the filter.
 *
 * Basically if the filter was {a: {b: {slug: {eq: "foo/bar"}}}} then it will
 * return all the nodes that have `node.slug === "foo/bar"`. That usually (but
 * not always) at most one node for slug, but this filter can apply to anything.
 *
 * The only exception is `id`, since internally there can be at most one node
 * per `id` so there's a minor optimization for that (no need for Sets).
 */
export const getNodesByTypedChain = (
  typedKey: string,
  comparator: string, // $eq, $nin, etc
  value: boolean | number | string,
  filterCache: Map<
    string,
    {
      buckets: Map<string | number | boolean, Set<IGatsbyNode>>
      opCache: {
        minValue?: string | number | boolean
        maxValue?: string | number | boolean
        nodesOrderedByValue?: Array<IGatsbyNode>
        valueToIndexOffset?: Map<string | number | boolean, [number, number]>
      }
    }
  >
): Set<IGatsbyNode> | undefined => {
  const byTypedKey = filterCache?.get(typedKey)

  if (!byTypedKey) {
    // This can happen for various edge case reasons. It means we have to go
    // through Sift now.
    return undefined
  }

  if (comparator === "$eq") {
    return byTypedKey.buckets.get(value)
  }

  // TODO: add explicit support for a filter with from-to range, in which case there's a lt/lte and gt/gte and the returned sets won't be unnecessarily large

  if (comparator === "$lte") {
    const loc = byTypedKey.opCache.valueToIndexOffset!.get(value)
    if (!loc) {
      // Query may ask for a value that doesn't appear in the set
      // In that case, if the value is bigger than the last value, return all
      // nodes. Otherwise return an empty set.

      if (byTypedKey.opCache.maxValue < value) {
        // Return whole set
        return new Set(byTypedKey.opCache.nodesOrderedByValue)
      }

      return new Set()
    }
    return new Set(
      byTypedKey.opCache.nodesOrderedByValue!.slice(0, loc![0] + loc![1])
    )
  }

  if (comparator === "$gte") {
    const loc = byTypedKey.opCache.valueToIndexOffset!.get(value)
    if (!loc) {
      // Query may ask for a value that doesn't appear in the set
      // In that case, if the value is smaller than the first value, return all
      // nodes. Otherwise return an empty set.
      if (byTypedKey.opCache.minValue > value) {
        // Return whole set
        return new Set(byTypedKey.opCache.nodesOrderedByValue)
      }
    }
    return new Set(byTypedKey.opCache.nodesOrderedByValue!.slice(loc![0]))
  }

  throw new Error(
    "Unknown comparator trying to fetch bucket cache. Supported comparators should be whitelisted but received `" +
      comparator +
      "`, anyways"
  )
}
