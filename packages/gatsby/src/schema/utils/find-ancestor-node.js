const { getById } = require(`../db`)

const findAncestorNode = (childNode, predicate) => {
  let node = childNode
  do {
    if (predicate(node)) {
      return node
    }
  } while ((node = node.parent && getById(node.parent)))
  return null
}

module.exports = findAncestorNode
