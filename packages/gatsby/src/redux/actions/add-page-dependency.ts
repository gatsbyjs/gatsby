import { store } from "../"

import { createPageDependency as internalCreatePageDependency } from "./internal"

export const createPageDependency = ({
  path,
  nodeId,
  connection,
}: Parameters<typeof internalCreatePageDependency>[0]): void => {
  const {
    componentDataDependencies: { connections, nodes },
  } = store.getState()

  // Check that the dependencies aren't already recorded so we
  // can avoid creating lots of very noisy actions.
  const nodeDependencyExists =
    !nodeId || (nodeId && nodes.has(nodeId) && nodes.get(nodeId).has(path))
  const connectionDependencyExists =
    !connection ||
    (connection &&
      connections.has(connection) &&
      connections.get(connection).has(path))

  if (nodeDependencyExists && connectionDependencyExists) {
    return
  }

  // It's new, let's dispatch it
  store.dispatch(internalCreatePageDependency({ path, nodeId, connection }))
}
