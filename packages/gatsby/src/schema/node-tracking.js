const _ = require(`lodash`)
const { getNode, getNodes } = require(`../redux`)

/**
 * Map containing links between inline objects or arrays
 * and Node that contains them
 * @type {Object.<(Object|Array),string>}
 */
const rootNodeMap = new WeakMap()

const trackedPaths = new Map()

const registerTrackedPath = (type, path) => {
  if (trackedPaths.has(type)) {
    trackedPaths.get(type).add(path)
  } else {
    trackedPaths.set(type, new Set([path]))
  }

  getNodes()
    .filter(node => node.internal.type === type)
    .forEach(node => trackInlineObjectInRootNodeByPath(node, path))
}

exports.registerTrackedPath = registerTrackedPath

const getRootNodeId = node => rootNodeMap.get(node)

const trackInlineObjectInRootNodeByPath = (node, path) => {
  const selector = path.split(`.`)
  const parents = new Set()
  getValuesFromSelector({
    object: node,
    selector,
    parents,
  })
  parents.forEach(parent => {
    if (node !== parent && !rootNodeMap.has(parent)) {
      rootNodeMap.set(parent, node.id)
    }
  })
}

/**
 * Adds link between inline objects/arrays contained in Node object
 * and that Node object.
 * @param {Node} node Root Node
 */
const trackInlineObjectsInRootNode = node => {
  if (
    node &&
    node.internal &&
    node.internal.type &&
    trackedPaths.has(node.internal.type)
  ) {
    trackedPaths.get(node.internal.type).forEach(path => {
      trackInlineObjectInRootNodeByPath(node, path)
    })
  }
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

const getValuesFromPath = (object, path) => {
  const results = []
  getValuesFromSelector({ object, results, selector: path.split(`.`) })
  return results
}

const getValuesFromSelector = ({
  object,
  selector,
  results = null,
  parents = null,
  index = 0,
  value = null,
}) => {
  if (!value) {
    const key = selector[index]
    value = object[key]
  }

  if (_.isArray(value)) {
    value.forEach(item => {
      getValuesFromSelector({
        value: item,
        selector,
        results,
        object: value,
        parents,
        index,
      })
    })
  } else if (selector.length === index + 1) {
    if (parents) {
      parents.add(object)
    }
    if (results) {
      results.push(value)
    }
  } else if (_.isPlainObject(value)) {
    getValuesFromSelector({
      object: value,
      selector,
      results,
      parents,
      index: index + 1,
    })
  }
}

exports.getValuesFromPath = getValuesFromPath
