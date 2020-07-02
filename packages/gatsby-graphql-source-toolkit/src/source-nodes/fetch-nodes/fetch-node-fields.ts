import {
  IGatsbyNodeDefinition,
  IRemoteNode,
  ISourcingContext,
} from "../../types"
import { collectNodeFieldOperationNames } from "../utils/node-definition-helpers"
import { combinePages, paginate, planPagination } from "./paginate"
import {
  findNodeFieldPath,
  getFirstValueByPath,
} from "../utils/field-path-utils"

export async function addPaginatedFields(
  context: ISourcingContext,
  def: IGatsbyNodeDefinition,
  node: IRemoteNode
): Promise<IRemoteNode> {
  const nodeFieldQueries = collectNodeFieldOperationNames(def.document)
  const remoteId = context.idTransform.remoteNodeToId(node, def)
  const variables = def.nodeQueryVariables(remoteId)

  for (const fieldQuery of nodeFieldQueries) {
    const plan = planPagination(context, def.document, fieldQuery, variables)
    const pages = paginate(context, plan)
    const result = await combinePages(pages, plan)

    if (!result || !result.data) {
      continue
    }
    const nodeRoot = findNodeFieldPath(def.document, fieldQuery)
    const nodeData = getFirstValueByPath(result.data, nodeRoot) ?? {}
    Object.assign(node, nodeData)
  }
  return node
}
