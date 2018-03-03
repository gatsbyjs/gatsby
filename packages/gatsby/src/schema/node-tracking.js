const _ = require(`lodash`)
const { getNode, getNodes } = require(`../redux`)

/**
 * Map containing links between inline objects or arrays
 * and Node that contains them
 * @type {Object.<(Object|Array),string>}
 */
const rootNodeMap = new WeakMap()

const getRootNodeId = node => rootNodeMap.get(node)

/**
 * Add link between passed data and Node. This function shouldn't be used
 * directly. Use higher level `trackInlineObjectsInRootNode`
 * @see trackInlineObjectsInRootNode
 * @param {(Object|Array)} data Inline object or array
 * @param {string} nodeId Id of node that contains data passed in first parameter
 */
const addRootNodeToInlineObject = (data, nodeId) => {
  if (_.isPlainObject(data) || _.isArray(data)) {
    _.each(data, o => addRootNodeToInlineObject(o, nodeId))
    rootNodeMap.set(data, nodeId)
  }
}

/**
 * Adds link between inline objects/arrays contained in Node object
 * and that Node object.
 * @param {Node} node Root Node
 */
// const nodeDigestTracked = new Set()
const trackInlineObjectsInRootNode = node => {
  // const id =
  // node && node.internal && node.internal.contentDigest
  // ? node.internal.contentDigest
  // : node.id
  // if (nodeDigestTracked.has(id)) {
  // return node
  // }

  _.each(node, (v, k) => {
    // Ignore the node internal object.
    if (k === `internal`) {
      return
    }
    addRootNodeToInlineObject(v, node.id)
  })

  // nodeDigestTracked.add(id)
  return node
}
exports.trackInlineObjectsInRootNode = trackInlineObjectsInRootNode

/**
 * Finds top most ancestor of node that contains passed Object or Array
 * @param {(Object|Array)} obj Object/Array belonging to Node object or Node object
 * @returns {Node} Top most ancestor
 */
function findRootNode(obj) {
  // Find the root node.
  let rootNode = obj
  let whileCount = 0
  let rootNodeId
  while (
    (rootNodeId = getRootNodeId(rootNode) || rootNode.parent) &&
    (getNode(rootNode.parent) !== undefined || getNode(rootNodeId)) &&
    whileCount < 101
  ) {
    if (rootNodeId) {
      rootNode = getNode(rootNodeId)
    } else {
      rootNode = getNode(rootNode.parent)
    }
    whileCount += 1
    if (whileCount > 100) {
      console.log(
        `It looks like you have a node that's set its parent as itself`,
        rootNode
      )
    }
  }

  return rootNode
}

exports.findRootNode = findRootNode

// Track nodes that are already in store
_.each(getNodes(), node => {
  trackInlineObjectsInRootNode(node)
})
