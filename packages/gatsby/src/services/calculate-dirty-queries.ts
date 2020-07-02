import { calcInitialDirtyQueryIds, groupQueryIds } from "../query"
import { IBuildContext, IGroupedQueryIds } from "./"
import { assertStore } from "../utils/assert-store"

export async function calculateDirtyQueries({
  store,
}: Partial<IBuildContext>): Promise<{
  queryIds: IGroupedQueryIds
}> {
  assertStore(store)

  const state = store.getState()
  // TODO: Check filesDirty from context

  const queryIds = calcInitialDirtyQueryIds(state)
  return { queryIds: groupQueryIds(queryIds) }
}
