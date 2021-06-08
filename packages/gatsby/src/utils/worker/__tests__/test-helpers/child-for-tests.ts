import { getNode } from "../../../../datastore"

// re-export all usual methods from production worker
export * from "../../child"

// additional functions to be able to write assertions that won't be available in production code
export function getNodeFromWorker(nodeId: string): ReturnType<typeof getNode> {
  return getNode(nodeId)
}
