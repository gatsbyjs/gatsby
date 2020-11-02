import { reporter } from "./reporter"

export async function installPlugins(
  plugins: Array<string>,
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
    reporter.error(
      `Did not install Gatsby, or the version of gatsby-cli is too old`
    )
    return void 0
  }

  const { addPlugins } = require(installPluginCommand)

  return addPlugins(plugins, rootPath)
}
