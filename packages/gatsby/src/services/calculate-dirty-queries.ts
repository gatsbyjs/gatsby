import { calcInitialDirtyQueryIds, groupQueryIds } from "../query"
import { IBuildContext } from "../state-machines/develop"

export async function calculateDirtyQueries({
  store,
  filesDirty,
}: IBuildContext): Promise<any> {
  const state = store?.getState()
  if (filesDirty) {
    // Do stuff
  }

  const queryIds = calcInitialDirtyQueryIds(state)
  return { queryIds: groupQueryIds(queryIds) }
}
