const { getNodes, getNode } = require(`../../../redux/nodes`)
const { isProductionBuild } = require(`../../utils`)

const cache = new Map()

const getNodesByType = type => {
  if (isProductionBuild && cache.has(type)) {
    return cache.get(type)
  }
  const nodes = getNodes().filter(node => node.internal.type === type)
  if (isProductionBuild) {
    cache.set(type, nodes)
  }
  return nodes
}

module.exports = {
  getNode,
  getNodes,
  getNodesByType,
}
