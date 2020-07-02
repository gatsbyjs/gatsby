import { ISourcingContext, IRemoteNode } from "../../types"
import {
  collectListOperationNames,
  getGatsbyNodeDefinition,
} from "../utils/node-definition-helpers"
import { paginate, planPagination } from "./paginate"
import { addPaginatedFields } from "./fetch-node-fields"

/**
 * Fetches and paginates remote nodes by type while reporting progress
 */
export async function* fetchAllNodes(
  context: ISourcingContext,
  remoteTypeName: string
): AsyncIterable<IRemoteNode> {
  const { gatsbyApi, formatLogMessage } = context
  const { reporter } = gatsbyApi
  const nodeDefinition = getGatsbyNodeDefinition(context, remoteTypeName)

  const activity = reporter.activityTimer(
    formatLogMessage(`fetching ${nodeDefinition.remoteTypeName}`)
  )
  activity.start()

  try {
    const listOperations = collectListOperationNames(nodeDefinition.document)

    for (const nodeListQuery of listOperations) {
      const nodes = fetchNodeList(context, remoteTypeName, nodeListQuery)
      for await (const node of nodes) {
        yield node
      }
    }
  } finally {
    activity.end()
  }
}

export async function* fetchNodeList(
  context: ISourcingContext,
  remoteTypeName: string,
  listOperationName: string
): AsyncIterable<IRemoteNode> {
  const typeNameField = context.gatsbyFieldAliases[`__typename`]
  const nodeDefinition = getGatsbyNodeDefinition(context, remoteTypeName)

  const plan = planPagination(
    context,
    nodeDefinition.document,
    listOperationName
  )

  for await (const page of paginate(context, plan)) {
    const partialNodes = plan.adapter.getItems(page.fieldValue)

    for (const node of partialNodes) {
      if (!node || node[typeNameField] !== remoteTypeName) {
        // Possible when fetching complex interface or union type fields
        // or when some node is `null`
        continue
      }
      // TODO: run in parallel?
      yield addPaginatedFields(context, nodeDefinition, node)
    }
  }
}
