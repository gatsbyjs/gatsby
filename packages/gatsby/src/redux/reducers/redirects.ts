import _ from "lodash"
import { IGatsbyState, IRedirect, ActionsUnion } from "../types"

const redirects = new Map<string, IRedirect[]>()

function exists(newRedirect: IRedirect): boolean {
  const fromPathRedirects = redirects.get(newRedirect.fromPath)

  if (!fromPathRedirects) return false

  return fromPathRedirects.some(redirect => _.isEqual(redirect, newRedirect))
}

function add(redirect: IRedirect): void {
  let samePathRedirects = redirects.get(redirect.fromPath)

  if (!samePathRedirects) {
    samePathRedirects = []
    redirects.set(redirect.fromPath, samePathRedirects)
  }

  samePathRedirects.push(redirect)
}

export const redirectsReducer = (
  state: IGatsbyState["redirects"] = [],
  action: ActionsUnion
): IGatsbyState["redirects"] => {
  switch (action.type) {
    case `CREATE_REDIRECT`: {
      const redirect = action.payload

      // Add redirect only if it wasn't yet added to prevent duplicates
      if (!exists(redirect)) {
        add(redirect)

        state.push(redirect)
      }

      return state
    }

    case `DELETE_REDIRECT`: {
      const r = state.filter(
        redirect =>
          redirect.fromPath !== action.payload.fromPath &&
          redirect.toPath !== action.payload.toPath &&
          redirect.isPermanent !== action.payload.isPermanent &&
          redirect.redirectInBrowser !== action.payload.redirectInBrowser
      )

      redirects.delete(action.payload.fromPath)

      return r
    }

    default:
      return state
  }
}
