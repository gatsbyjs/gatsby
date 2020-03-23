/* @flow */

import { createPageDependency } from "./actions/add-page-dependency"
const { store } = require(`./index`)

/**
 * Get all nodes from redux store.
 *
 * @returns {Array}
 */
const getNodes = () => {
  const nodes = store.getState().nodes
  if (nodes) {
    return Array.from(nodes.values())
  } else {
    return []
  }
}

exports.getNodes = getNodes

/** Get node by id from store.
 *
 * @param {string} id
 * @returns {Object}
 */
const getNode = id => store.getState().nodes.get(id)

exports.getNode = getNode

/**
 * Get all nodes of type from redux store.
 *
 * @param {string} type
 * @returns {Array}
 */
const getNodesByType = type => {
  const nodes = store.getState().nodesByType.get(type)
  if (nodes) {
    return Array.from(nodes.values())
  } else {
    return []
  }
}

exports.getNodesByType = getNodesByType

/**
 * Get all type names from redux store.
 *
 * @returns {Array}
 */
const getTypes = () => Array.from(store.getState().nodesByType.keys())

exports.getTypes = getTypes

/**
 * Determine if node has changed.
 *
 * @param {string} id
 * @param {string} digest
 * @returns {boolean}
 */
exports.hasNodeChanged = (id, digest) => {
  const node = store.getState().nodes.get(id)
  if (!node) {
    return true
  } else {
    return node.internal.contentDigest !== digest
  }
}

/**
 * Get node and save path dependency.
 *
 * @param {string} id
 * @param {string} path
 * @returns {Object} node
 */
exports.getNodeAndSavePathDependency = (id, path) => {
  const node = getNode(id)
  createPageDependency({ path, nodeId: id })
  return node
}

exports.saveResolvedNodes = async (nodeTypeNames, resolver) => {
  for (const typeName of nodeTypeNames) {
    const nodes = store.getState().nodesByType.get(typeName)
    const resolvedNodes = new Map()
    if (nodes) {
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
}

/**
 * Get node and save path dependency.
 *
 * @param {string} typeName
 * @param {string} id
 * @returns {Object|void} node
 */
const getResolvedNode = (typeName, id) => {
  const { nodesByType, resolvedNodesCache } = store.getState()
  const nodes /*: Map<mixed> */ = nodesByType.get(typeName)

  if (!nodes) {
    return null
  }

  let node = nodes.get(id)

  if (!node) {
    return null
  }

  const resolvedNodes = resolvedNodesCache.get(typeName)

  if (resolvedNodes) {
    node.__gatsby_resolved = resolvedNodes.get(id)
  }

  return node
}

exports.getResolvedNode = getResolvedNode

const addResolvedNodes = (typeName, arr) => {
  const { nodesByType, resolvedNodesCache } = store.getState()
  const nodes /*: Map<mixed> */ = nodesByType.get(typeName)

  if (!nodes) {
    return
  }

  const resolvedNodes = resolvedNodesCache.get(typeName)

  nodes.forEach(node => {
    if (resolvedNodes) {
      node.__gatsby_resolved = resolvedNodes.get(node.id)
    }
    arr.push(node)
  })
}

exports.addResolvedNodes = addResolvedNodes

/**
 * Given a ("flat") filter path leading up to "eq", a set of node types, and a
 * cache, create a cache that for each resulting value of the filter contains
 * all the Nodes in a Set (or, if the property is `id`, just the Nodes).
 * This cache is used for applying the filter and is a massive improvement over
 * looping over all the nodes, when the number of pages (/nodes) scale up.
 *
 * @param {Array<string>} chain
 * @param {Array<string>} nodeTypeNames
 * @param {undefined | Map<string, Map<string | number | boolean, Node>>} typedKeyValueIndexes
 *   This object lives in query/query-runner.js and is passed down runQuery
 * @returns {undefined}
 */
const ensureIndexByTypedChain = (
  chain,
  nodeTypeNames,
  typedKeyValueIndexes
) => {
  const chained = chain.join(`+`)

  const nodeTypeNamePrefix = nodeTypeNames.join(`,`) + `/`
  // The format of the typedKey is `type,type/path+to+eqobj`
  const typedKey = nodeTypeNamePrefix + chained

  let byKeyValue = typedKeyValueIndexes.get(typedKey)
  if (byKeyValue) {
    return
  }

  const { nodes, resolvedNodesCache } = store.getState()

  byKeyValue = new Map() // Map<node.value, Set<all nodes with this value for this key>>
  typedKeyValueIndexes.set(typedKey, byKeyValue)

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

    let v = node
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

    // Special case `id` as that bucket never receives more than one element
    if (chained === `id`) {
      // Note: this is not a duplicate from `nodes` because this set only
      //       contains nodes of this type. Page nodes are a subset of all nodes
      byKeyValue.set(v, node)
      return
    }

    let set = byKeyValue.get(v)
    if (!set) {
      set = new Set()
      byKeyValue.set(v, set)
    }
    set.add(node)
  })
}

exports.ensureIndexByTypedChain = ensureIndexByTypedChain

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
 *
 * @param {Array<string>} chain Note: `eq` is assumed to be the leaf prop here
 * @param {boolean | number | string} value This is the value being filtered for
 * @param {Array<string>} nodeTypeNames
 * @param {undefined | Map<string, Map<string | number | boolean, Node>>} typedKeyValueIndexes
 *   This object lives in query/query-runner.js and is passed down runQuery
 * @returns {Array<Node> | undefined}
 */
const getNodesByTypedChain = (
  chain,
  value,
  nodeTypeNames,
  typedKeyValueIndexes
) => {
  const key = chain.join(`+`)

  const typedKey = nodeTypeNames.join(`,`) + `/` + key

  let byTypedKey = typedKeyValueIndexes?.get(typedKey)
  return byTypedKey?.get(value)
}

exports.getNodesByTypedChain = getNodesByTypedChain
