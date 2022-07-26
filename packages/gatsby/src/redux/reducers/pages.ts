import {
  IGatsbyState,
  IGatsbyPage,
  IDeleteCacheAction,
  ICreatePageAction,
  IDeletePageAction,
  IMaterializePageMode,
} from "../types"

export const pagesReducer = (
  state: IGatsbyState["pages"] = new Map<string, IGatsbyPage>(),
  action:
    | IDeleteCacheAction
    | ICreatePageAction
    | IDeletePageAction
    | IMaterializePageMode
): IGatsbyState["pages"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()

    case `CREATE_PAGE`: {
      // throws an error if the page is not created by a plugin
      if (!action.plugin?.name) {
        console.log(``)
        console.error(JSON.stringify(action, null, 4))
        console.log(``)

        throw new Error(
          `Pages can only be created by plugins. There wasn't a plugin set when creating this page.`
        )
      }

      // Add page to the state with the path as key
      state.set(action.payload.path, action.payload)

      return state
    }

    case `DELETE_PAGE`: {
      state.delete(action.payload.path)

      return state
    }

    case `MATERIALIZE_PAGE_MODE`: {
      const page = state.get(action.payload.path)
      if (!page) {
        throw new Error(`Could not find page by path: ${action.payload.path}`)
      }
      page.mode = action.payload.pageMode
      return state
    }

    default:
      return state
  }
}
