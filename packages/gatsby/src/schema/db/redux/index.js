const { getNodes, getNode } = require(`../../../redux/nodes`)

const cache = new Map()

const getNodesByType = type => {
  if (cache.has(type)) {
    return cache.get(type)
  }
  const nodes = getNodes().filter(node => node.internal.type === type)
  cache.set(type, nodes)
  return nodes
}

module.exports = {
  getNode,
  getNodes,
  getNodesByType,
}
