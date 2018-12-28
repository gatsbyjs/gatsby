const { getNodes, getNode } = require(`../../../redux/nodes`)
const isProductionBuild = require(`../../utils/is-production-build`)

// const { emitter } = require(`../../../redux`)
// let isBootstrapFinished = false
// emitter.on(`BOOTSTRAP_FINISHED`, () => (isBootstrapFinished = true))

const cache = new Map()

// TODO: We need a proper type mapping in the store
// new Map([type: new Map([id, node])])
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
