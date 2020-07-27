import {
  calcInitialDirtyQueryIds,
  calcDirtyQueryIds,
  groupQueryIds,
} from "../query"
import { IGroupedQueryIds } from "./"
import { IQueryRunningContext } from "../state-machines/query-running/types"
import { assertStore } from "../utils/assert-store"

export async function calculateDirtyQueries({
  store,
  firstRun,
}: Partial<IQueryRunningContext>): Promise<{
  queryIds: IGroupedQueryIds
}> {
  assertStore(store)

  const state = store.getState()

  const queryIds = firstRun
    ? calcInitialDirtyQueryIds(state)
    : calcDirtyQueryIds(state)
  return { queryIds: groupQueryIds(queryIds) }
}
