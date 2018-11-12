const parentNodes = new WeakMap()

// FIXME: Do we need to track empty arrays and objects?
const trackObjects = node => {
  const convert = obj => {
    Object.values(obj).forEach(value => {
      // isObject(value) || Array.isArray(value)
      // TODO: && !(value instanceof Date)
      if (value && typeof value === `object` && !parentNodes.has(value)) {
        parentNodes.set(value, node.id)
        convert(value)
      }
    })
  }
  // TODO: Exclude `internal`
  convert(node)
}

const getParentNodeId = obj => parentNodes.get(obj)

// FIXME: This should be done when nodes are loaded from cache.
// Or why not persist the node-tracking cache as well?
// => ../../redux/index.js
// require(`../db`)
//   .getNodes()
//   .forEach(trackObjects)

module.exports = {
  getParentNodeId,
  trackObjects,
}
