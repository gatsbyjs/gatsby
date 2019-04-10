const _ = require(`lodash`)
const apiRunner = require(`./api-runner-node`)
const { store } = require(`../redux`)
const { getNode, getNodes } = require(`../db/nodes`)
const { actions } = require(`../redux/actions`)

const { deleteNode, log } = actions

/**
 * Finds the name of all plugins which implement Gatsby APIs that
 * may create nodes, but which have not actually created any nodes.
 */
function discoverPluginsWithoutNodes(storeState) {
  // Discover which plugins implement APIs which may create nodes
  const nodeCreationPlugins = storeState.flattenedPlugins
    .filter(
      plugin =>
        plugin.nodeAPIs.includes(`sourceNodes`) &&
        plugin.name !== `default-site-plugin`
    )
    .map(plugin => plugin.name)

  // Find out which plugins own already created nodes
  const nodeOwners = _.uniq(
    Array.from(getNodes()).reduce((acc, node) => {
      acc.push(node.internal.owner)
      return acc
    }, [])
  )
  return _.difference(nodeCreationPlugins, nodeOwners)
}

module.exports = async ({ parentSpan } = {}) => {
  await apiRunner(`sourceNodes`, {
    traceId: `initial-sourceNodes`,
    waitForCascadingActions: true,
    parentSpan: parentSpan,
  })

  const state = store.getState()

  // Warn about plugins that should have created nodes but didn't.
  const pluginsWithNoNodes = discoverPluginsWithoutNodes(state)
  pluginsWithNoNodes.forEach(name => {
    const message = `The ${name} plugin has generated no Gatsby nodes. Do you need it?`
    store.dispatch(log({ message, type: `warn` }))
  })

  // Garbage collect stale data nodes
  const touchedNodes = Object.keys(state.nodesTouched)
  const staleNodes = Array.from(getNodes()).filter(node => {
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
        const message =
          `It looks like you have a node that's set its parent as itself: ` +
          rootNode
        store.dispatch(log({ message, type: `warn` }))
      }
    }

    return !_.includes(touchedNodes, rootNode.id)
  })

  if (staleNodes.length > 0) {
    staleNodes.forEach(node => store.dispatch(deleteNode({ node })))
  }
}
