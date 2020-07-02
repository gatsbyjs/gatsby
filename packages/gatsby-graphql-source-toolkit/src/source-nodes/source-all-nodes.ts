import { fetchAllNodes } from "./fetch-nodes/fetch-lists"
import { createNodes } from "./node-actions/create-nodes"
import { ISourcingConfig } from "../types"
import { createSourcingContext } from "./sourcing-context"

/**
 * Uses sourcing config to fetch all data from the remote GraphQL API
 * and create gatsby nodes (using Gatsby `createNode` action)
 */
export async function sourceAllNodes(config: ISourcingConfig) {
  // Context instance passed to every nested call
  const context = createSourcingContext(config)
  const promises: Promise<void>[] = []

  for (const remoteNodeType of context.gatsbyNodeDefs.keys()) {
    const remoteNodes = fetchAllNodes(context, remoteNodeType)
    const promise = createNodes(context, remoteNodeType, remoteNodes)
    promises.push(promise)
  }
  await Promise.all(promises)
}
