import { getNode } from "../../../../datastore"
import apiRunner from "../../../api-runner-node"
import { store } from "../../../../redux"

// re-export all usual methods from production worker
export * from "../../child"

// additional functions to be able to write assertions that won't be available in production code

// test: datastore
export function getNodeFromWorker(nodeId: string): ReturnType<typeof getNode> {
  return getNode(nodeId)
}

// test: config
export async function runAPI(apiName: string): Promise<any> {
  return await apiRunner(apiName)
}

// test: config
export function getAPIRunResult(): string | undefined {
  return (global as any).test
}

// test:share-state
export function getPage(): any {
  return store.getState().pages.get(`/foo/`)
}
