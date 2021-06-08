import { getNode } from "../../../../datastore"
import reporter from "gatsby-cli/lib/reporter"

// re-export all usual methods from production worker
export * from "../../child"

// additional functions to be able to write assertions that won't be available in production code

// test: datastore
export function getNodeFromWorker(nodeId: string): ReturnType<typeof getNode> {
  return getNode(nodeId)
}

// test: reporter
export function log(message: string): boolean {
  reporter.log(message)
  return true
}
