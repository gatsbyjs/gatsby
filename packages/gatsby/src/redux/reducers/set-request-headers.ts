import { IGatsbyState, ActionsUnion } from "../types"

/**
 * Takes in a domain and headers for that domain, from the setRequestHeaders and configureImageCDNDomains actions, and stores them in a Map to be accessed when making requests and getting list of ImageCDN domains.
 */
export const setRequestHeadersReducer = (
  state: IGatsbyState["requestHeaders"] = new Map(),
  action: ActionsUnion
): IGatsbyState["requestHeaders"] => {
  switch (action.type) {
    case `CONFIGURE_IMAGE_CDN`:
    case `SET_REQUEST_HEADERS`: {
      const { headers, domain } = action.payload

      state.set(domain, headers)
      return state
    }
    default:
      return state
  }
}
