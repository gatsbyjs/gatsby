import { silent as resolveFromSilent } from "resolve-from"
import * as semver from "semver"
import { IPluginInfo } from "../types"
import { processPlugin } from "../process-plugin"

export const GATSBY_CLOUD_PLUGIN_NAME = `gatsby-plugin-gatsby-cloud`
export const GATSBY_PLUGIN_PREVIEW_NAME = `@gatsby-cloud-pkg/gatsby-plugin-preview`

function addCloudPluginWhenInstalled(
  plugins: Array<IPluginInfo>,
  rootDir: string,
  name: string
): void {
  const cloudPluginLocation = resolveFromSilent(rootDir, name)

  if (cloudPluginLocation) {
    const processedGatsbyCloudPlugin = processPlugin(
      {
        resolve: name,
        options: {},
      },
      rootDir
    )
    plugins.push(processedGatsbyCloudPlugin)
  }
}

export function addGatsbyPluginPreviewWhenInstalled(
  plugins: Array<IPluginInfo>,
  rootDir: string
): void {
  addCloudPluginWhenInstalled(plugins, rootDir, GATSBY_PLUGIN_PREVIEW_NAME)
}

export function addGatsbyPluginCloudPluginWhenInstalled(
  plugins: Array<IPluginInfo>,
  rootDir: string
): void {
  addCloudPluginWhenInstalled(plugins, rootDir, GATSBY_CLOUD_PLUGIN_NAME)
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
