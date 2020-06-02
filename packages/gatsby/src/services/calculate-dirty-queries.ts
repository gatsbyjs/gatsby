import { calcInitialDirtyQueryIds, groupQueryIds } from "../query"
import { IBuildContext } from "./"

export interface IGroupedQueryIds {
  pageQueryIds: string[]
  staticQueryIds: string[]
}

export async function calculateDirtyQueries({
  store,
}: Partial<IBuildContext>): Promise<{
  queryIds: IGroupedQueryIds
}> {
  const state = store?.getState()
  // TODO: Check filesDirty from context

  const queryIds = calcInitialDirtyQueryIds(state)
  return { queryIds: groupQueryIds(queryIds) }
}
