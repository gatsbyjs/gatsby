import {
  IGatsbyState,
  IDeleteCacheAction,
  ICreateClientVisitedPage,
  ICreateServerVisitedPage,
} from "../types"

type StateMap = Map<"client" | "server", Set<string>>

// The develop server always wants these page components.
const createDefault = (): StateMap => {
  const defaults = new Set<string>()
  defaults.add(`component---cache-dev-404-page-js`)
  defaults.add(`component---src-pages-404-js`)
  defaults.add(`component---src-pages-index-js`)

  const state: StateMap = new Map([
    [`client`, new Set(defaults)],
    [`server`, new Set(defaults)],
  ])

  return state
}

export const visitedPagesReducer = (
  state: IGatsbyState["visitedPages"] = createDefault(),
  action:
    | IDeleteCacheAction
    | ICreateClientVisitedPage
    | ICreateServerVisitedPage
): IGatsbyState["visitedPages"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return createDefault()

    case `CREATE_CLIENT_VISITED_PAGE`: {
      const client = state.get(`client`)
      if (client) {
        client.add(action.payload.componentChunkName)
      }

      return state
    }

    case `CREATE_SERVER_VISITED_PAGE`: {
      const server = state.get(`server`)
      if (server) {
        server.add(action.payload.componentChunkName)
      }

      return state
    }

    default:
      return state
  }
}
