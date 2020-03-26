import { store } from "./"
import { IGatsbyNode } from "./types"
import { createPageDependency } from "./actions/add-page-dependency"

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
  chain: string[],
  comparator: string, // $eq, $lte, etc
  nodeTypeNames: string[],
  filterCache: Map<
    string,
    {
      buckets: Map<string | number | boolean, Set<IGatsbyNode>>
      opCache: {
        nodesOrderedByValue?: Array<IGatsbyNode>
        valueToIndexOffset?: Map<string | number | boolean, [number, number]>
      }
    }
  >
): void => {
  const chained = chain.join(`+`)

  // The format of the typedKey is `type,type/$eq/path+to+eqobj`
  const typedKey = nodeTypeNames.join(`,`) + `/` + comparator + `/` + chained

  if (filterCache.has(typedKey)) {
    return
  }

  const { nodes, resolvedNodesCache } = store.getState()

  const byKeyValue: {
    buckets: Map<string | number | boolean, Set<IGatsbyNode>>
    opCache: {
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

  if (comparator === "$lte") {
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

    byKeyValue.opCache.nodesOrderedByValue = arr
    byKeyValue.opCache.valueToIndexOffset = offsets
  }
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
  chain: string[],
  comparator: string, // $eq, $nin, etc
  value: boolean | number | string,
  nodeTypeNames: string[],
  filterCache: Map<
    string,
    {
      buckets: Map<string | number | boolean, Set<IGatsbyNode>>
      opCache: {
        nodesOrderedByValue?: Array<IGatsbyNode>
        valueToIndexOffset?: Map<string | number | boolean, [number, number]>
      }
    }
  >
): Set<IGatsbyNode> | undefined => {
  const key = chain.join(`+`)

  const typedKey = nodeTypeNames.join(`,`) + `/` + comparator + `/` + key

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
    // Note: we fully map all values so loc must exist. Same for opCache
    const loc = byTypedKey.opCache.valueToIndexOffset!.get(value)
    return new Set(byTypedKey.opCache.nodesOrderedByValue!.slice(0, loc![0] + loc![1]))
  }

  throw new Error(
    "Unknown comparator trying to fetch bucket cache. Supported comparators should be whitelisted but received `" +
      comparator +
      "`, anyways"
  )
}
