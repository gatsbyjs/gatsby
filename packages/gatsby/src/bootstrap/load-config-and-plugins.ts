import reporter from "gatsby-cli/lib/reporter"

import { IFlattenedPlugin } from "./load-plugins/types"

import { preferDefault } from "../bootstrap/prefer-default"
import { getConfigFile } from "../bootstrap/get-config-file"
import { loadPlugins } from "../bootstrap/load-plugins"
import { internalActions } from "../redux/actions"
import loadThemes from "../bootstrap/load-themes"
import { store } from "../redux"

export async function loadConfigAndPlugins({
  siteDirectory,
}: {
  siteDirectory: string
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
