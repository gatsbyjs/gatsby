import {
  IGatsbyState,
  IDeleteCacheAction,
  ICreateSSRVisitedPage,
} from "../types"

export const ssrVisitedPageReducer = (
  state: IGatsbyState["ssrVisitedPages"] = new Set<string>(),
  action: IDeleteCacheAction | ICreateSSRVisitedPage
): IGatsbyState["ssrVisitedPages"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Set()

    case `CREATE_SSR_VISITED_PAGE`: {
      state.add(action.payload.componentChunkName)

      return state
    }

    default:
      return state
  }
}
