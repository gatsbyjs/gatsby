import { reporter } from "./utils/reporter"
import path from "path"
import { PluginConfigMap } from "."
import { requireResolve } from "./utils/require-utils"

const resolveGatsbyPath = (rootPath: string): string | never => {
  try {
    const gatsbyPath = requireResolve(`gatsby/package.json`, {
      paths: [rootPath],
    })

    if (!gatsbyPath) throw new Error()

    return gatsbyPath
  } catch (e) {
    throw new Error(
      `Could not find "gatsby" in ${rootPath}. Perhaps it wasn't installed properly?`
    )
  }
}

const resolveGatsbyCliPath = (
  rootPath: string,
  gatsbyPath: string
): string | never => {
  try {
    let installPluginCommand
    try {
      installPluginCommand = requireResolve(
        `gatsby-cli/lib/handlers/plugin-add`,
        {
          // Try to find gatsby-cli in the site root, or in the site's gatsby dir
          paths: [rootPath, path.dirname(gatsbyPath)],
        }
      )
    } catch (e) {
      // We'll error out later
    }
    try {
      if (!installPluginCommand) {
        // Older location
        console.log(`looking in old place`)
        installPluginCommand = requireResolve(`gatsby-cli/lib/plugin-add`, {
          paths: [rootPath, path.dirname(gatsbyPath)],
        })
      }
    } catch (e) {
      // We'll error out later
    }

    if (!installPluginCommand) {
      throw new Error()
    }

    return installPluginCommand
  } catch (e) {
    throw new Error(
      `Could not find a suitable version of gatsby-cli. Please report this issue at https://www.github.com/gatsbyjs/gatsby/issues`
    )
  }
}

const addPluginsToProject = async (
  installPluginCommand: string,
  plugins: Array<string>,
  pluginOptions: PluginConfigMap = {},
  rootPath: string,
  packages: Array<string>
): Promise<void> => {
  try {
    const { addPlugins } = require(installPluginCommand)
    await addPlugins(plugins, pluginOptions, rootPath, packages)
  } catch (e) {
    throw new Error(
      `Something went wrong when trying to add the plugins to the project: ${
        (e as Error).message
      }`
    )
  }
}

export async function installPlugins(
  plugins: Array<string>,
  pluginOptions: PluginConfigMap = {},
  rootPath: string,
  packages: Array<string>
): Promise<void> {
  try {
    const gatsbyPath = resolveGatsbyPath(rootPath)
    const installPluginCommand = resolveGatsbyCliPath(rootPath, gatsbyPath)

    await addPluginsToProject(
      installPluginCommand,
      plugins,
      pluginOptions,
      rootPath,
      packages
    )
  } catch (e) {
    reporter.error((e as Error).message)
    return
  }
}
