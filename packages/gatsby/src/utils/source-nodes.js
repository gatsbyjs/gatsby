const _ = require(`lodash`)

const apiRunner = require(`./api-runner-node`)
const { store, getNode } = require(`../redux`)
const { boundActionCreators } = require(`../redux/actions`)
const { deleteNodes } = boundActionCreators

module.exports = async () => {
  await apiRunner(`sourceNodes`, {
    traceId: `initial-sourceNodes`,
    waitForCascadingActions: true,
  })

  const state = store.getState()

  // Garbage collect stale data nodes
  const touchedNodes = Object.keys(state.nodesTouched)
  const staleNodes = _.values(state.nodes).filter(node => {
    // Find the root node.
    let rootNode = node
    let whileCount = 0
    while (
      rootNode.parent &&
      getNode(rootNode.parent) !== undefined &&
      whileCount < 101
    ) {
      rootNode = getNode(rootNode.parent)
      whileCount += 1
      if (whileCount > 100) {
        console.log(
          `It looks like you have a node that's set its parent as itself`,
          rootNode
        )
      }
    }

    return !_.includes(touchedNodes, rootNode.id)
  })

  if (staleNodes.length > 0) {
    deleteNodes(staleNodes.map(n => n.id))
  }
}
