import { IGatsbyState, ISetDomainRequestHeaders } from "../types"

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
