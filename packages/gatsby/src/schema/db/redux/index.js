const { getNodes, getNode } = require(`../../../redux/nodes`)
const isProductionBuild = require(`../../utils/is-production-build`)

const { emitter } = require(`../../../redux`)
let isBootstrapFinished = false
emitter.on(`BOOTSTRAP_FINISHED`, () => (isBootstrapFinished = true))

const cache = new Map()
let totalCount = 0

// TODO: We need a proper type mapping in the store
// new Map([type: new Map([id, node])])
const getNodesByType = type => {
  const allNodes = getNodes()
  if (
    isProductionBuild ||
    (!isBootstrapFinished && allNodes.length === totalCount)
  ) {
    if (cache.has(type)) {
      return cache.get(type)
    }
  }
  const nodes = allNodes.filter(node => node.internal.type === type)
  if (isProductionBuild || !isBootstrapFinished) {
    cache.set(type, nodes)
    totalCount = nodes.length
  }
  return nodes
}

module.exports = {
  getNode,
  getNodes,
  getNodesByType,
}
