import { calcInitialDirtyQueryIds, groupQueryIds } from "../query"

export async function calculateDirtyQueries({
  store,
  filesDirty,
}): Promise<any> {
  const state = store.getState()
  // if (filesDirty) {

  // }

  const queryIds = calcInitialDirtyQueryIds(state)
  return { queryIds: groupQueryIds(queryIds) }
}
