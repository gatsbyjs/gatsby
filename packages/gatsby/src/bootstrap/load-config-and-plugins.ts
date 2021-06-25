import reporter from "gatsby-cli/lib/reporter"
import telemetry from "gatsby-telemetry"

import { IFlattenedPlugin } from "./load-plugins/types"

import { preferDefault } from "../bootstrap/prefer-default"
import { getConfigFile } from "../bootstrap/get-config-file"
import { loadPlugins } from "../bootstrap/load-plugins"
import { internalActions } from "../redux/actions"
import loadThemes from "../bootstrap/load-themes"
import { store } from "../redux"
import handleFlags from "../utils/handle-flags"
import availableFlags from "../utils/flags"

export async function loadConfigAndPlugins({
  siteDirectory,
  processFlags = false,
}: {
  siteDirectory: string
  processFlags?: boolean
}): Promise<{
  config: any
  flattenedPlugins: Array<IFlattenedPlugin>
}> {
  // Try opening the site's gatsby-config.js file.
  const { configModule, configFilePath } = await getConfigFile(
    siteDirectory,
    `gatsby-config`
  )
  let config = preferDefault(configModule)

  // The root config cannot be exported as a function, only theme configs
  if (typeof config === `function`) {
    reporter.panic({
      id: `10126`,
      context: {
        configName: `gatsby-config`,
        siteDirectory,
      },
    })
  }

  if (config && processFlags) {
    // Setup flags
    if (config) {
      // Get flags
      const { enabledConfigFlags, unknownFlagMessage, message } = handleFlags(
        availableFlags,
        config.flags
      )

      if (unknownFlagMessage !== ``) {
        reporter.warn(unknownFlagMessage)
      }

      //  set process.env for each flag
      enabledConfigFlags.forEach(flag => {
        process.env[flag.env] = `true`
      })

      // Print out message.
      if (message !== ``) {
        reporter.info(message)
      }

      //  track usage of feature
      enabledConfigFlags.forEach(flag => {
        if (flag.telemetryId) {
          telemetry.trackFeatureIsUsed(flag.telemetryId)
        }
      })

      // Track the usage of config.flags
      if (config.flags) {
        telemetry.trackFeatureIsUsed(`ConfigFlags`)
      }
    }
  }

  // theme gatsby configs can be functions or objects
  if (config) {
    const plugins = await loadThemes(config, {
      configFilePath,
      rootDir: siteDirectory,
    })
    config = plugins.config
  }

  store.dispatch(internalActions.setSiteConfig(config))

  const flattenedPlugins = await loadPlugins(config, siteDirectory)

  return { config, flattenedPlugins }
}
