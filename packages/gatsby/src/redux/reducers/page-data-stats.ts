import { IGatsbyState, ActionsUnion } from "./../types"

export const pageDataStatsReducer = (
  state: IGatsbyState["pageDataStats"] = new Map(),
  action: ActionsUnion
): IGatsbyState["pageDataStats"] => {
  switch (action.type) {
    case `ADD_PAGE_DATA_STATS`:
      state.set(action.payload.filePath, action.payload.size)
      return state
    default:
      return state
  }
}
