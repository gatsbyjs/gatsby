import { ISiteConfig, IRawSiteConfig } from "../types"
import { IPluginRefObject, PluginRef } from "gatsby-plugin-utils/dist/types"

export function normalizePlugin(
  plugin: IPluginRefObject | string
): IPluginRefObject {
  if (typeof plugin === `string`) {
    return {
      resolve: plugin,
      options: {},
    }
  }

  if (plugin.options?.plugins) {
    plugin.options = {
      ...plugin.options,
      plugins: normalizePlugins(plugin.options.plugins),
    }
  }

  return plugin
}

export function normalizePlugins(
  plugins?: Array<PluginRef>
): Array<IPluginRefObject> {
  return (plugins || []).map(normalizePlugin)
}

export const normalizeConfig = (config: IRawSiteConfig = {}): ISiteConfig => {
  return {
    ...config,
    plugins: (config.plugins || []).map(normalizePlugin),
  }
}
