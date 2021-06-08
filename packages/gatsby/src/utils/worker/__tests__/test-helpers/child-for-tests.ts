import { getNode } from "../../../../datastore"
import { store } from "../../../../redux"
import { IGatsbyPage } from "../../../../redux/types"

// re-export all usual methods from production worker
export * from "../../child"

// additional functions to be able to write assertions that won't be available in production code
export function getNodeFromWorker(nodeId: string): ReturnType<typeof getNode> {
  return getNode(nodeId)
}

// test:share-state
export function getPage(pathname: string): IGatsbyPage | undefined {
  return store.getState().pages.get(pathname)
}
