import { silent as resolveFromSilent } from "resolve-from"
import * as semver from "semver"
import { IPluginInfo } from "../types"
import { processPlugin } from "../process-plugin"

export const GATSBY_CLOUD_PLUGIN_NAME = `gatsby-plugin-gatsby-cloud`

export async function addGatsbyPluginCloudPluginWhenInstalled(
  plugins: Array<IPluginInfo>,
  rootDir: string
): Promise<void> {
  const cloudPluginLocation = resolveFromSilent(
    rootDir,
    GATSBY_CLOUD_PLUGIN_NAME
  )

  if (cloudPluginLocation) {
    const processedGatsbyCloudPlugin = await processPlugin(
      {
        resolve: cloudPluginLocation,
        options: {},
      },
      rootDir
    )
    plugins.push(processedGatsbyCloudPlugin)
  }
}

export function incompatibleGatsbyCloudPlugin(
  plugins: Array<IPluginInfo>
): boolean {
  const plugin = plugins.find(
    plugin => plugin.name === GATSBY_CLOUD_PLUGIN_NAME
  )

  return !semver.satisfies(plugin!.version, `>=4.0.0-alpha`, {
    includePrerelease: true,
  })
}
