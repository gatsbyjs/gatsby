import { ActionsUnion, IGatsbyState } from "../types"

export const pendingPageDataWritesReducer = (
  state: IGatsbyState["pendingPageDataWrites"] = {
    pagePaths: new Set(),
    templatePaths: new Set(),
  },
  action: ActionsUnion
): IGatsbyState["pendingPageDataWrites"] => {
  switch (action.type) {
    case `ADD_PENDING_PAGE_DATA_WRITE`:
      state.pagePaths.add(action.payload.path)
      return state

    case `ADD_PENDING_TEMPLATE_DATA_WRITE`:
      state.templatePaths.add(action.payload.componentPath)
      return state

    case `CLEAR_PENDING_PAGE_DATA_WRITES`: {
      state.pagePaths.clear()
      state.templatePaths.clear()
      return state
    }

    default:
      return state
  }
}
