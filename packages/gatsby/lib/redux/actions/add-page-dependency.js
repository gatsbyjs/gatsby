const _ = require("lodash")

const { store } = require("../")
const { actions } = require("../actions.js")

exports.addPageDependency = ({ path, nodeId, connection }) => {
  const state = store.getState()

  // Check that the dependencies aren't already recorded so we
  // can avoid creating lots of very noisy actions.
  let nodeDependencyExists = false
  let connectionDependencyExists = false
  if (!nodeId) {
    nodeDependencyExists = true
  }
  if (nodeId && _.includes(state.pageDataDependencies.nodes[nodeId], path)) {
    nodeDependencyExists = true
  }
  if (!connection) {
    connectionDependencyExists = true
  }
  if (
    connection && _.has(state, `pageDataDependencies.connections.${connection}`)
  ) {
    connectionDependencyExists = true
  }
  if (nodeDependencyExists && connectionDependencyExists) {
    return false
  }

  // It's new, let's dispatch it
  const action = actions.addPageDependency({ path, nodeId, connection })
  store.dispatch(action)
}
