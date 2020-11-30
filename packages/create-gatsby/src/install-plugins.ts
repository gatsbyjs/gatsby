import { reporter } from "./reporter"
import path from "path"
import { PluginConfigMap } from "."
export async function installPlugins(
  plugins: Array<string>,
  pluginOptions: PluginConfigMap = {},
  rootPath: string,
  packages: Array<string>
): Promise<void> {
  let installPluginCommand
  let gatsbyPath

  try {
    gatsbyPath = require.resolve(`gatsby/package.json`, {
      paths: [rootPath],
    })
  } catch (e) {
    // Not found
    console.warn(e)
  }

  if (!gatsbyPath) {
    reporter.error(
      `Could not find "gatsby" in ${rootPath}. Perhaps it wasn't installed properly?`
    )
    return
  }

  try {
    installPluginCommand = require.resolve(`gatsby-cli/lib/plugin-add`, {
      // Try to find gatsby-cli in the site root, or in the site's gatsby dir
      paths: [rootPath, path.dirname(gatsbyPath)],
    })
  } catch (e) {
    // The file is missing
  }

  if (!installPluginCommand) {
    reporter.error(`gatsby-cli not installed, or is too old`)
    return
  }

  const { addPlugins } = require(installPluginCommand)

  await addPlugins(plugins, pluginOptions, rootPath, packages)
}
