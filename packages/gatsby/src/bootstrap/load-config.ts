import { Span } from "opentracing"
import reporter from "gatsby-cli/lib/reporter"

import { IProgram } from "../commands/types"
import { IFlattenedPlugin } from "./load-plugins/types"

import { preferDefault } from "../bootstrap/prefer-default"
import { getConfigFile } from "../bootstrap/get-config-file"
import { loadPlugins } from "../bootstrap/load-plugins"
import { internalActions } from "../redux/actions"
import loadThemes from "../bootstrap/load-themes"
import { store } from "../redux"

export async function loadConfig({
  program,
  parentSpan,
}: {
  parentSpan?: Span
  program: IProgram
}): Promise<{
  config: any
  flattenedPlugins: Array<IFlattenedPlugin>
}> {
  // Try opening the site's gatsby-config.js file.
  let activity = reporter.activityTimer(`open and validate gatsby-configs`, {
    parentSpan,
  })
  activity.start()
  const { configModule, configFilePath } = await getConfigFile(
    program.directory,
    `gatsby-config`
  )
  let config = preferDefault(configModule)

  // The root config cannot be exported as a function, only theme configs
  if (typeof config === `function`) {
    reporter.panic({
      id: `10126`,
      context: {
        configName: `gatsby-config`,
        path: program.directory,
      },
    })
  }

  // theme gatsby configs can be functions or objects
  if (config) {
    const plugins = await loadThemes(config, {
      configFilePath,
      rootDir: program.directory,
    })
    config = plugins.config
  }

  store.dispatch(internalActions.setSiteConfig(config))

  activity.end()

  activity = reporter.activityTimer(`load plugins`, {
    parentSpan,
  })
  activity.start()
  const flattenedPlugins = await loadPlugins(config, program.directory)
  activity.end()

  return { config, flattenedPlugins }
}
