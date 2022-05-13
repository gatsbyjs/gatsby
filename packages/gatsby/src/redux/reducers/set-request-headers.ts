import reporter from "gatsby-cli/lib/reporter"
import url from "url"

import { IGatsbyState, ISetDomainRequestHeaders } from "../types"

export const setRequestHeadersReducer = (
  state: IGatsbyState["requestHeaders"] = new Map(),
  action: ISetDomainRequestHeaders
): IGatsbyState["requestHeaders"] => {
  switch (action.type) {
    case `SET_REQUEST_HEADERS`: {
      const { headers, domain, pluginName } = action.payload

      const noHeaders = typeof headers !== `object`
      const noDomain = typeof domain !== `string`

      if (noHeaders) {
        reporter.warn(
          `Plugin ${pluginName} called actions.setRequestHeaders with a headers property that isn't an object.`
        )
      }

      if (noDomain) {
        reporter.warn(
          `Plugin ${pluginName} called actions.setRequestHeaders with a domain property that isn't a string.`
        )
      }

      if (noDomain || noHeaders) {
        return state
      }

      const baseDomain = url.parse(domain)?.hostname

      if (baseDomain) {
        state.set(baseDomain, headers)
      } else {
        reporter.warn(
          `Plugin ${pluginName} called actions.setRequestHeaders with a domain that is not a valid URL. (${domain})`
        )
      }

      return state
    }
    default:
      return state
  }
}
