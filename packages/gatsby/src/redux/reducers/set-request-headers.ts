import { IGatsbyState, ISetDomainRequestHeaders } from "../types"

/**
 * Takes in a domain and headers for that domain, from the setRequestHeaders action, and stores them in a Map to be accessed when making requests.
 */
export const setRequestHeadersReducer = (
  state: IGatsbyState["requestHeaders"] = new Map(),
  action: ISetDomainRequestHeaders
): IGatsbyState["requestHeaders"] => {
  switch (action.type) {
    case `SET_REQUEST_HEADERS`: {
      const { headers, domain } = action.payload

      state.set(domain, headers)
      return state
    }
    default:
      return state
  }
}
