import { calcInitialDirtyQueryIds, groupQueryIds } from "../query"
import { IGroupedQueryIds } from "./"
import reporter from "gatsby-cli/lib/reporter"
import { IQueryRunningContext } from "../state-machines/query-running/types"

export async function calculateDirtyQueries({
  store,
}: Partial<IQueryRunningContext>): Promise<{
  queryIds: IGroupedQueryIds
}> {
  if (!store) {
    reporter.panic(`Cannot run service without a redux store`)
  }
  const state = store.getState()
  // TODO: Check filesDirty from context

  const queryIds = calcInitialDirtyQueryIds(state)
  return { queryIds: groupQueryIds(queryIds) }
}
