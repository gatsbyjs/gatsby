import {
  IGatsbyState,
  IDeleteCacheAction,
  ICreateClientVisitedPage,
} from "../types"

// The develop server always wants these page components.
const defaults = new Set<string>()
defaults.add(`component---cache-dev-404-page-js`)
defaults.add(`component---src-pages-404-js`)

export const clientVisitedPageReducer = (
  state: IGatsbyState["clientVisitedPages"] = new Set<string>(defaults),
  action: IDeleteCacheAction | ICreateClientVisitedPage
): IGatsbyState["clientVisitedPages"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Set<string>(defaults)

    case `CREATE_CLIENT_VISITED_PAGE`: {
      state.add(action.payload.componentChunkName)

      return state
    }

    default:
      return state
  }
}
