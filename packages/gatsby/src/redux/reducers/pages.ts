import normalize from "./normalize-path"
import { readFileSync } from "fs"
import {
  IGatsbyState,
  IGatsbyPage,
  IDeleteCacheAction,
  ICreatePageAction,
  IDeletePageAction,
} from "../types"

const ssrCache = new Map<string, boolean>()

export const pagesReducer = (
  state: IGatsbyState["pages"] = new Map<string, IGatsbyPage>(),
  action: IDeleteCacheAction | ICreatePageAction | IDeletePageAction
): IGatsbyState["pages"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return new Map()

    case `CREATE_PAGE`: {
      action.payload.component = normalize(action.payload.component)

      // TODO do AST check like queries
      if (!ssrCache.has(action.payload.component)) {
        if (
          readFileSync(action.payload.component)
            .toString()
            .includes(`getServerData`)
        ) {
          ssrCache.set(action.payload.component, true)
        } else {
          ssrCache.set(action.payload.component, false)
        }
      }

      if (ssrCache.get(action.payload.component)) {
        action.payload.mode = `SSR`
      }

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

    default:
      return state
  }
}
