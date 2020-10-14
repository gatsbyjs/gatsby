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

  const newDirtyQueryIds: Array<string> = []
  state.queries.trackedQueries.forEach((query, queryId) => {
    if (query.dirty !== 0) {
      newDirtyQueryIds.push(queryId)
    }
  })

  console.log(`Dirty queries:`, newDirtyQueryIds)

  const queryIds = firstRun
    ? calcInitialDirtyQueryIds(state)
    : calcDirtyQueryIds(state)
  return { queryIds: groupQueryIds(queryIds) }
}
