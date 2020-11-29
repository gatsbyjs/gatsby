import {
  IGatsbyState,
  IDeleteCacheAction,
  ICreatePageAction,
  IDeletePageAction,
} from "../types"

export const pageContextHashesReducer = (
  state: IGatsbyState["pageContextHashes"] = new Map<string, string>(),
  action: IDeleteCacheAction | ICreatePageAction | IDeletePageAction
): IGatsbyState["pageContextHashes"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()

    case `CREATE_PAGE`: {
      // Add page to the state with the path as key
      state.set(action.payload.path, action.pageContextHash)
      return state
    }

    case `DELETE_PAGE`: {
      state.delete(action.payload.path)

      return state
    }

    default:
      return state
  }
}
