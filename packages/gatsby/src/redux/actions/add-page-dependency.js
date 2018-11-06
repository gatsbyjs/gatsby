const _ = require(`lodash`)

const { store } = require(`../`)
const { actions } = require(`../actions.js`)

function createPageDependency({ path, nodeId, connection }) {
  const state = store.getState()

  // Check that the dependencies aren't already recorded so we
  // can avoid creating lots of very noisy actions.
  let nodeDependencyExists = false
  let connectionDependencyExists = false
  if (!nodeId) {
    nodeDependencyExists = true
  }
  if (
    nodeId &&
    _.includes(state.componentDataDependencies.nodes[nodeId], path)
  ) {
    nodeDependencyExists = true
  }
  if (!connection) {
    connectionDependencyExists = true
  }
  if (
    connection &&
    _.includes(state.componentDataDependencies.connections, connection)
  ) {
    connectionDependencyExists = true
  }
  if (nodeDependencyExists && connectionDependencyExists) {
    return
  }

  // It's new, let's dispatch it
  const action = actions.createPageDependency({ path, nodeId, connection })
  store.dispatch(action)
}

/**
 * A Graphql resolver middleware that runs `resolver` and creates a
 * page dependency with the returned node.
 *
 * @param resolver A graphql resolver. A function that take arguments
 * (node, args, context, info) and return a node
 * @returns A new graphql resolver
 */
function pageDependencyResolver(resolver) {
  return async (node, args, context = {}, info = {}) => {
    const { path } = context
    const result = await resolver(node, args, context, info)

    // Call createPageDependency on each result
    if (path) {
      const asArray = _.isArray(result) ? result : [result]
      for (const node of asArray) {
        // using module.exports here so it can be mocked
        module.exports.createPageDependency({
          path,
          nodeId: node.id,
        })
      }
    }

    // Finally return the found node
    return result
  }
}

module.exports = {
  createPageDependency,
  pageDependencyResolver,
}
