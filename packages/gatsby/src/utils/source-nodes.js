const report = require(`gatsby-cli/lib/reporter`)

const apiRunner = require(`./api-runner-node`)
const { store } = require(`../redux`)
const { getNode, getNodes } = require(`../db/nodes`)
const { boundActionCreators } = require(`../redux/actions`)
const { deleteNode } = boundActionCreators

/**
 * Finds the name of all plugins which implement Gatsby APIs that
 * may create nodes, but which have not actually created any nodes.
 */
function discoverPluginsWithoutNodes(storeState, nodes) {
  // Find out which plugins own already created nodes
  const nodeOwnerSet = new Set([`default-site-plugin`])
  nodes.forEach(node => nodeOwnerSet.add(node.internal.owner))

  return storeState.flattenedPlugins
    .filter(
      plugin =>
        // "Can generate nodes"
        plugin.nodeAPIs.includes(`sourceNodes`) &&
        // "Has not generated nodes"
        !nodeOwnerSet.has(plugin.name)
    )
    .map(plugin => plugin.name)
}

/**
 * Warn about plugins that should have created nodes but didn't.
 */
function warnForPluginsWithoutNodes(state, nodes) {
  const pluginsWithNoNodes = discoverPluginsWithoutNodes(state, nodes)

  pluginsWithNoNodes.map(name =>
    report.warn(
      `The ${name} plugin has generated no Gatsby nodes. Do you need it?`
    )
  )
}

/**
 * Return the set of nodes for which its root node has not been touched
 */
function getStaleNodes(state, nodes) {
  return nodes.filter(node => {
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

    return !state.nodesTouched.has(rootNode.id)
  })
}

/**
 * Find all stale nodes and delete them
 */
function deleteStaleNodes(state, nodes) {
  const staleNodes = getStaleNodes(state, nodes)

  if (staleNodes.length > 0) {
    staleNodes.forEach(node => deleteNode({ node }))
  }
}

module.exports = async ({ webhookBody = {}, parentSpan } = {}) => {
  await apiRunner(`sourceNodes`, {
    traceId: `initial-sourceNodes`,
    waitForCascadingActions: true,
    parentSpan,
    webhookBody,
  })

  const state = store.getState()
  const nodes = getNodes()

  warnForPluginsWithoutNodes(state, nodes)

  deleteStaleNodes(state, nodes)
}
