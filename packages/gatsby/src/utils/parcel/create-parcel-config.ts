import { COMPILED_CACHE_DIR, IParcelConfig } from "./compile-gatsby-files"
import { normalizeConfig } from "../../bootstrap/load-plugins/utils/normalize"
import { checkLocalPlugin } from "../../bootstrap/load-plugins/utils/check-local-plugin"
import { IGatsbyConfig } from "../../internal"
import { IPluginRefObject } from "../../bootstrap/load-plugins/types"

/**
 * Creates a parcel config from local plugins defined in gatsby-config.js
 */
export function createLocalPluginParcelConfig(
  config: IGatsbyConfig,
  siteRoot: string
): IParcelConfig | undefined {
  const normalizedConfig = normalizeConfig(config)

  return normalizedConfig?.plugins?.reduce(
    (parcelConfig: IParcelConfig, plugin: IPluginRefObject) => {
      const { validLocalPlugin, localPluginPath = `` } = checkLocalPlugin(
        plugin,
        siteRoot
      )
      if (validLocalPlugin && localPluginPath) {
        parcelConfig.push({
          entry: localPluginPath,
          dist: `${siteRoot}/${COMPILED_CACHE_DIR}/${plugin.resolve}`,
        })
      }
      return parcelConfig
    },
    []
  )
}
