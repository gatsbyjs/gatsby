import { reporter } from "./reporter"

export async function installPlugins(
  plugins: Array<string>,
  pluginOptions: Record<string, Record<string, any> | undefined> = {},
  rootPath: string
): Promise<void> {
  let installPluginCommand

  try {
    installPluginCommand = require.resolve(`gatsby-cli/lib/plugin-add`, {
      paths: [rootPath],
    })
  } catch (e) {
    // The file is missing
  }

  if (!installPluginCommand) {
    reporter.error(`gatsby-cli not installed, or is too old`)
    return void 0
  }

  const { addPlugins } = require(installPluginCommand)

  return addPlugins(plugins, pluginOptions, rootPath)
}
