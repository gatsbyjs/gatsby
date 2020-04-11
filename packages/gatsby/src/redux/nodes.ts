import { store } from "./"
import { IGatsbyNode } from "./types"
import { createPageDependency } from "./actions/add-page-dependency"
import { IDbQueryElemMatch } from "../db/common/query"

export type FilterCacheKey = string
export type FilterCache = Map<string | number | boolean, Set<IGatsbyNode>>
export type FiltersCache = Map<FilterCacheKey, FilterCache>

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
  cacheKey: FilterCacheKey,
  chain: string[],
  nodeTypeNames: string[],
  filtersCache: FiltersCache
): void => {
  const state = store.getState()
  const resolvedNodesCache = state.resolvedNodesCache

  const filterCache: FilterCache = new Map()
  filtersCache.set(cacheKey, filterCache)

  // We cache the subsets of nodes by type, but only one type. So if searching
  // through one node type we can prevent a search through all nodes, otherwise
  // it's probably faster to loop through all nodes. Perhaps. Maybe.

  if (nodeTypeNames.length === 1) {
    getNodesByType(nodeTypeNames[0]).forEach(node => {
      addNodeToFilterCache(node, chain, filterCache, resolvedNodesCache)
    })
  } else {
    // Here we must first filter for the node type
    // This loop is expensive at scale (!)
    state.nodes.forEach(node => {
      if (!nodeTypeNames.includes(node.internal.type)) {
        return
      }

      addNodeToFilterCache(node, chain, filterCache, resolvedNodesCache)
    })
  }
}

function addNodeToFilterCache(
  node: IGatsbyNode,
  chain: Array<string>,
  filterCache: FilterCache,
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
      typeof v !== `boolean`) ||
    i !== chain.length
  ) {
    // Not sure whether this is supposed to happen, but this means that either
    // - The node chain ended with `undefined`, or
    // - The node chain ended in something other than a primitive, or
    // - A part in the chain in the object was not an object
    return
  }

  let set = filterCache.get(v)
  if (!set) {
    set = new Set()
    filterCache.set(v, set)
  }
  set.add(node)
}

export const ensureIndexByElemMatch = (
  cacheKey: FilterCacheKey,
  filter: IDbQueryElemMatch,
  nodeTypeNames: Array<string>,
  filtersCache: FiltersCache
): void => {
  // Given an elemMatch filter, generate the cache that contains all nodes that
  // matches a given value for that sub-query

  const state = store.getState()
  const { resolvedNodesCache } = state

  const filterCache: FilterCache = new Map()
  filtersCache.set(cacheKey, filterCache)

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
    state.nodes.forEach(node => {
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
}

function addNodeToBucketWithElemMatch(
  node: IGatsbyNode,
  valueAtCurrentStep: any, // Arbitrary step on the path inside the node
  filter: IDbQueryElemMatch,
  filterCache: FilterCache,
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
    // Found undefined before the end of the path, so let Sift take over
    return
  }

  // `v` should now be an elemMatch target, probably an array (but maybe not)

  if (Array.isArray(valueAtCurrentStep)) {
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
export const getFilterCacheByTypedChain = (
  cacheKey: FilterCacheKey,
  value: boolean | number | string,
  filtersCache: FiltersCache
): Set<IGatsbyNode> | undefined => {
  const byTypedKey = filtersCache?.get(cacheKey)
  return byTypedKey?.get(value)
}
