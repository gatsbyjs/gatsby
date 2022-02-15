import { NodePluginArgs } from "gatsby"

import { setLastBuildTime } from "./helpers"

export function onPostBootstrap(
  gatsbyApi: NodePluginArgs,
  pluginOptions: IShopifyPluginOptions
): void {
  setLastBuildTime(gatsbyApi, pluginOptions)
}
