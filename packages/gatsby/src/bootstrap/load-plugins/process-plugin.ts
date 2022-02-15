import { IPluginInfo, PluginRef } from "./types"
import { createPluginId } from "./utils/create-id"
import { resolvePlugin } from "./resolve-plugin"
import { isString, isEmpty, set, merge } from "lodash"

export function processPlugin(plugin: PluginRef, rootDir: string): IPluginInfo {
  // Respect the directory that the plugin was sourced from initially
  rootDir = (!isString(plugin) && plugin.parentDir) || rootDir

  if (isString(plugin)) {
    const info = resolvePlugin(plugin, rootDir)

    return {
      ...info,
      pluginOptions: {
        plugins: [],
      },
    }
  }

  plugin.options = plugin.options || {}

  // Throw an error if there is an "option" key.
  if (
    isEmpty(plugin.options) &&
    !isEmpty((plugin as { option?: unknown }).option)
  ) {
    throw new Error(
      `Plugin "${plugin.resolve}" has an "option" key in the configuration. Did you mean "options"?`
    )
  }

  // Plugins can have plugins.
  if (plugin.subPluginPaths) {
    for (const subPluginPath of plugin.subPluginPaths) {
      const segments = subPluginPath.split(`.`)
      let roots: Array<any> = [plugin.options]

      let pathToSwap = segments

      for (const segment of segments) {
        if (segment === `[]`) {
          pathToSwap = pathToSwap.slice(0, pathToSwap.length - 1)
          roots = roots.flat()
        } else {
          roots = roots.map(root => root[segment])
        }
      }
      roots = roots.flat()

      const processed: Array<IPluginInfo> = []

      for (const root of roots) {
        const result = processPlugin(root, rootDir)
        processed.push(result)
      }

      set(plugin.options, pathToSwap, processed)
    }
  }

  // Add some default values for tests as we don't actually
  // want to try to load anything during tests.
  if (plugin.resolve === `___TEST___`) {
    const name = `TEST`

    return {
      id: createPluginId(name, plugin),
      name,
      version: `0.0.0-test`,
      pluginOptions: {
        plugins: [],
      },
      resolve: `__TEST__`,
    }
  }

  const info = resolvePlugin(plugin, rootDir)

  return {
    ...info,
    modulePath: plugin.modulePath,
    module: plugin.module,
    subPluginPaths: plugin.subPluginPaths
      ? Array.from(plugin.subPluginPaths)
      : undefined,
    id: createPluginId(info.name, plugin),
    pluginOptions: merge({ plugins: [] }, plugin.options),
  }
}
