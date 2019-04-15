const _ = require(`lodash`)

/**
 * Map containing links between inline objects or arrays
 * and Node that contains them
 * @type {Object.<(Object|Array),string>}
 */
const rootNodeMap = new WeakMap()

const getRootNodeId = node => rootNodeMap.get(node)

/**
 * @param {Object} data
 * @returns {Object} data without undefined values
 */
const omitUndefined = data => {
  const isPlainObject = _.isPlainObject(data)
  if (isPlainObject) {
    return _.pickBy(data, p => p !== undefined)
  }

  return data.filter(p => p !== undefined)
}

/**
 * @param {*} data
 * @return {boolean}
 */
const isTypeSupported = data => {
  if (data === null) {
    return true
  }

  const type = typeof data
  const isSupported =
    type === `number` ||
    type === `string` ||
    type === `boolean` ||
    data instanceof Date

  return isSupported
}

/**
 * Add link between passed data and Node. This function shouldn't be used
 * directly. Use higher level `trackInlineObjectsInRootNode`
 * @see trackInlineObjectsInRootNode
 * @param {(Object|Array)} data Inline object or array
 * @param {string} nodeId Id of node that contains data passed in first parameter
 * @param {boolean} sanitize Wether to strip objects of unuspported and not serializable fields
 * @param {string} [ignore] Fieldname that doesn't need to be tracked and sanitized
 *
 */
const addRootNodeToInlineObject = (data, nodeId, sanitize, isNode = false) => {
  const isPlainObject = _.isPlainObject(data)

  if (isPlainObject || _.isArray(data)) {
    let returnData = data
    if (sanitize) {
      returnData = isPlainObject ? {} : []
    }
    let anyFieldChanged = false
    _.each(data, (o, key) => {
      if (isNode && key === `internal`) {
        returnData[key] = o
        return
      }
      returnData[key] = addRootNodeToInlineObject(o, nodeId, sanitize)

      if (returnData[key] !== o) {
        anyFieldChanged = true
      }
    })

    if (anyFieldChanged) {
      data = omitUndefined(returnData)
    }

    // don't need to track node itself
    if (!isNode) {
      rootNodeMap.set(data, nodeId)
    }

    // arrays and plain objects are supported - no need to to sanitize
    return data
  }

  if (sanitize && !isTypeSupported(data)) {
    return undefined
  }
  // either supported or not sanitizing
  return data
}

/**
 * Adds link between inline objects/arrays contained in Node object
 * and that Node object.
 * @param {Node} node Root Node
 */
const trackInlineObjectsInRootNode = (node, sanitize = false) =>
  addRootNodeToInlineObject(node, node.id, sanitize, true)
exports.trackInlineObjectsInRootNode = trackInlineObjectsInRootNode

/**
 * Finds top most ancestor of node that contains passed Object or Array
 * @param {(Object|Array)} obj Object/Array belonging to Node object or Node object
 * @param {nodePredicate} [predicate] Optional callback to check if ancestor meets defined conditions
 * @returns {Node} Top most ancestor if predicate is not specified
 * or first node that meet predicate conditions if predicate is specified
 */
const findRootNodeAncestor = (obj, predicate = null) => {
  const { getNode } = require(`./nodes`)

  // Find the root node.
  let rootNode = obj
  let whileCount = 0
  let rootNodeId
  while (
    (!predicate || !predicate(rootNode)) &&
    (rootNodeId = getRootNodeId(rootNode) || rootNode.parent) &&
    ((rootNode.parent && getNode(rootNode.parent) !== undefined) ||
      getNode(rootNodeId)) &&
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

  return !predicate || predicate(rootNode) ? rootNode : null
}

function trackDbNodes() {
  const { getNodes } = require(`./nodes`)
  _.each(getNodes(), node => {
    trackInlineObjectsInRootNode(node)
  })
}

/**
 * @callback nodePredicate
 * @param {Node} node Node that is examined
 */
exports.findRootNodeAncestor = findRootNodeAncestor
exports.trackDbNodes = trackDbNodes
