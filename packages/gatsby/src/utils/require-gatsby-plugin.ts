import { pathToFileURL } from "url"

const pluginModuleCache = new Map<string, any>()

export function setGatsbyPluginCache(
  plugin: { name: string; resolve: string },
  module: string,
  moduleObject: any
): void {
  const key = `${plugin.name}/${module}`
  pluginModuleCache.set(key, moduleObject)
}

export async function requireGatsbyPlugin(
  plugin: {
    name: string
    resolve: string
    resolvedCompiledGatsbyNode?: string
  },
  module: string
): Promise<any> {
  const key = `${plugin.name}/${module}`

  let pluginModule = pluginModuleCache.get(key)
  if (!pluginModule) {
    let requirePluginModulePath: string

    if (module === `gatsby-node` && plugin.resolvedCompiledGatsbyNode) {
      requirePluginModulePath = plugin.resolvedCompiledGatsbyNode
    } else {
      requirePluginModulePath = `${plugin.resolve}/${module}`
    }

    try {
      pluginModule = require(requirePluginModulePath)
    } catch (failedToRequireError) {
      const url = pathToFileURL(`${requirePluginModulePath}.mjs`)

      // TODO: Refactor probably
      try {
        pluginModule = await import(url?.href)
      } catch (failedToImportError) {
        // TODO: Better error handling
        throw new Error(`Failed to import plugin ${requirePluginModulePath}`, {
          cause: failedToImportError,
        })
      }

      if (!pluginModule) {
        throw new Error(`Failed to require plugin ${requirePluginModulePath}`, {
          cause: failedToRequireError,
        })
      }
    }

    pluginModuleCache.set(key, pluginModule)
  }
  return pluginModule
}
