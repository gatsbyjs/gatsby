import { IGatsbyConfig, ISetSiteConfig } from "../types"

export const configReducer = (
  state: IGatsbyConfig = {},
  action: ISetSiteConfig
): IGatsbyConfig => {
  switch (action.type) {
    case `SET_SITE_CONFIG`: {
      return action.payload
    }
    default:
      return state
  }
}
