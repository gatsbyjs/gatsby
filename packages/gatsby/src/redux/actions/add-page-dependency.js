const { store } = require(`../`)
import * as actions from "./internal"

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
    state.componentDataDependencies.nodes.has(nodeId) &&
    state.componentDataDependencies.nodes.get(nodeId).has(path)
  ) {
    nodeDependencyExists = true
  }
  if (!connection) {
    connectionDependencyExists = true
  }
  if (
    connection &&
    state.componentDataDependencies.connections.has(connection) &&
    state.componentDataDependencies.connections.get(connection).has(path)
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

module.exports = createPageDependency
