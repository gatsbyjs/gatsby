import reporter from "gatsby-cli/lib/reporter"
import {
  COMPILED_CACHE_DIR,
  compileGatsbyFiles,
  IParcelConfig,
} from "../parcel/compile-gatsby-files"
import { normalizeConfig } from "../../bootstrap/load-plugins/utils/normalize"
import { checkLocalPlugin } from "../../bootstrap/load-plugins/utils/check-local-plugin"
import { IGatsbyConfig } from "../../internal"

export async function compileLocalPluginGatsbyFiles(
  config: IGatsbyConfig,
  siteDirectory: string
): Promise<void> {
  const normalizedConfig = normalizeConfig(config)

  const localPluginParcelConfig = normalizedConfig?.plugins?.reduce(
    (parcelConfig, plugin) => {
      const { validLocalPlugin, localPluginPath = `` } = checkLocalPlugin(
        plugin,
        siteDirectory
      )
      if (validLocalPlugin && localPluginPath) {
        parcelConfig.push({
          entry: localPluginPath,
          dist: `${siteDirectory}/${COMPILED_CACHE_DIR}/${plugin.resolve}`,
        })
      }
      return parcelConfig
    },
    [] as IParcelConfig
  )

  if (!localPluginParcelConfig?.length) {
    return
  }

  const activity = reporter.activityTimer(`compile local plugin gatsby files`)
  activity.start()
  await compileGatsbyFiles(localPluginParcelConfig)
  activity.end()
}
