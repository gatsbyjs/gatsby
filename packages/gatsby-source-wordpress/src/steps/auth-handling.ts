import type { GatsbyNodeApiHelpers } from "~/utils/gatsby-types"
import type { Step } from "./../utils/run-steps"
import type { IPluginOptions } from "~/models/gatsby-api"

let storedAuthSettings: IPluginOptions["auth"] | undefined

export const hideAuthPluginOptions: Step = async (
  _helpers: GatsbyNodeApiHelpers,
  pluginOptions: IPluginOptions
): Promise<void> => {
  // store auth settings so we can restore them later
  storedAuthSettings = pluginOptions.auth

  // remove auth from pluginOptions before we write out browser plugin options module,
  // so we don't leak into the browser
  delete pluginOptions.auth
}

export const restoreAuthPluginOptions: Step = async (
  _helpers: GatsbyNodeApiHelpers,
  pluginOptions: IPluginOptions
): Promise<void> => {
  if (storedAuthSettings) {
    // if we stored auth settings, restore them now after we've written out browser plugin options module
    // so engines can use them
    pluginOptions.auth = storedAuthSettings
  }
}
