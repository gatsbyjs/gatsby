import { ActionsUnion, IGatsbyState } from "../types"

export const pendingPageDataWritesReducer = (
  state: IGatsbyState["pendingPageDataWrites"] = {
    pagePaths: new Set(),
  },
  action: ActionsUnion
): IGatsbyState["pendingPageDataWrites"] => {
  switch (action.type) {
    case `ADD_PENDING_PAGE_DATA_WRITE`:
      state.pagePaths.add(action.payload.path)
      return state

    case `ADD_PENDING_TEMPLATE_DATA_WRITE`: {
      for (const page of action.payload.pages) {
        state.pagePaths.add(page)
      }
      return state
    }

    case `CLEAR_PENDING_PAGE_DATA_WRITE`: {
      state.pagePaths.delete(action.payload.page)
      return state
    }

    default:
      return state
  }
}
