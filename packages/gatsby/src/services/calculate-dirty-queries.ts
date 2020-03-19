import { calcInitialDirtyQueryIds, groupQueryIds } from "../query"

export async function calculateDirtyQueries({ store }): Promise<any> {
  const state = store.getState()
  const queryIds = calcInitialDirtyQueryIds(state)
  return { queryIds: groupQueryIds(queryIds) }
}
