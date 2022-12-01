import { resolveJSFilepath } from "../bootstrap/resolve-js-file-path"

const pluginModuleCache = new Map<string, any>()

export function setGatsbyPluginCache(
  plugin: { name: string; resolve: string },
  module: string,
  moduleObject: any
): void {
  const key = `${plugin.name}/${module}`
  pluginModuleCache.set(key, moduleObject)
}

export async function importGatsbyPlugin(
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
    let importPluginModulePath: string

    if (module === `gatsby-node` && plugin.resolvedCompiledGatsbyNode) {
      importPluginModulePath = plugin.resolvedCompiledGatsbyNode
    } else {
      importPluginModulePath = `${plugin.resolve}/${module}`
    }

    const pluginFilePath = resolveJSFilepath(
      process.cwd(),
      importPluginModulePath
    )

    pluginModule = await import(pluginFilePath)

    pluginModuleCache.set(key, pluginModule)
  }

  return pluginModule
}
