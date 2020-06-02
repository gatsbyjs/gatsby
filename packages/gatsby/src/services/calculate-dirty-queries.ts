import { calcInitialDirtyQueryIds, groupQueryIds } from "../query"
import { IBuildContext } from "../state-machines/develop"

export interface IGroupedQueryIds {
  pageQueryIds: string[]
  staticQueryIds: string[]
}

export async function calculateDirtyQueries({
  store,
  filesDirty,
}: Partial<IBuildContext>): Promise<{
  queryIds: IGroupedQueryIds
}> {
  const state = store?.getState()
  if (filesDirty) {
    // Do stuff
  }

  const queryIds = calcInitialDirtyQueryIds(state)
  return { queryIds: groupQueryIds(queryIds) }
}
