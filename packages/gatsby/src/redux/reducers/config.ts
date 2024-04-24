import type { IGatsbyConfig, ISetSiteConfig } from "../types";

export function configReducer(
  state: IGatsbyConfig | undefined = {},
  action: ISetSiteConfig,
): IGatsbyConfig {
  switch (action.type) {
    case "SET_SITE_CONFIG": {
      return action.payload;
    }
    default:
      return state;
  }
}
