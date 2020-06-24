import { calcInitialDirtyQueryIds, groupQueryIds } from "../query"
import { IBuildContext, IGroupedQueryIds } from "./"
import reporter from "gatsby-cli/lib/reporter"

export async function calculateDirtyQueries({
  store,
}: Partial<IBuildContext>): Promise<{
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
