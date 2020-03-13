import { store } from "../"

import { createPageDependency as internalCreatePageDependency } from "./internal"

export const createPageDependency = ({
  path,
  nodeId,
  connection,
}: {
  path: string
  nodeId: string
  connection: string
}): void => {
  const { componentDataDependencies } = store.getState()

  // Check that the dependencies aren't already recorded so we
  // can avoid creating lots of very noisy actions.
  let nodeDependencyExists = false
  let connectionDependencyExists = false
  if (!nodeId) {
    nodeDependencyExists = true
  }
  if (
    nodeId &&
    componentDataDependencies.nodes.has(nodeId) &&
    componentDataDependencies.nodes.get(nodeId).has(path)
  ) {
    nodeDependencyExists = true
  }
  if (!connection) {
    connectionDependencyExists = true
  }
  if (
    connection &&
    componentDataDependencies.connections.has(connection) &&
    componentDataDependencies.connections.get(connection).has(path)
  ) {
    connectionDependencyExists = true
  }
  if (nodeDependencyExists && connectionDependencyExists) {
    return
  }

  // It's new, let's dispatch it
  store.dispatch(internalCreatePageDependency({ path, nodeId, connection }))
}
