import { calcDirtyQueryIds, groupQueryIds } from "../query"
import { IGroupedQueryIds } from "./"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { assertStore } from "../utils/assert-store"

export async function calculateDirtyQueries({
  store,
}: Partial<IQueryRunningContext>): Promise<{
  queryIds: IGroupedQueryIds
}> {
  assertStore(store)
  const state = store.getState()
  const queryIds = calcDirtyQueryIds(state)
  return { queryIds: groupQueryIds(queryIds) }
}
