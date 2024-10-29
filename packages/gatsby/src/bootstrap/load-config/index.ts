import reporter from "gatsby-cli/lib/reporter"
import { preferDefault } from "../prefer-default"
import { getConfigFile } from "../get-config-file"
import { internalActions } from "../../redux/actions"
import { loadThemes } from "../load-themes"
import { store } from "../../redux"
import handleFlags from "../../utils/handle-flags"
import availableFlags from "../../utils/flags"
import { IProgram } from "../../commands/types"
import { IGatsbyConfig } from "../../internal"

export async function loadConfig({
  siteDirectory,
  processFlags = false,
}: {
  siteDirectory: string
  processFlags?: boolean
  program?: IProgram
}): Promise<IGatsbyConfig> {
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

  if (processFlags) {
    // Setup flags
    const {
      enabledConfigFlags,
      unknownFlagMessage,
      unfitFlagMessage,
      message,
    } = handleFlags(availableFlags, config?.flags ?? {})

    if (unknownFlagMessage !== ``) {
      reporter.warn(unknownFlagMessage)
    }
    if (unfitFlagMessage !== ``) {
      reporter.warn(unfitFlagMessage)
    }
    //  set process.env for each flag
    enabledConfigFlags.forEach(flag => {
      process.env[flag.env] = `true`
    })

    // Print out message.
    if (message !== ``) {
      reporter.info(message)
    }

    process.env.GATSBY_SLICES = `true`
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

  return config
}
