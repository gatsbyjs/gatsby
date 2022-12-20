import {
  resolveJSFilepath,
  maybeAddFileProtocol,
} from "../bootstrap/resolve-js-file-path"
import { preferDefault } from "../bootstrap/prefer-default"

const pluginModuleCache = new Map<string, any>()

export function setGatsbyPluginCache(
  plugin: { name: string; resolve: string; importKey?: string },
  module: string,
  moduleObject: any
): void {
  const key = `${plugin.name}/${module}`
  pluginModuleCache.set(key, moduleObject)

  const additionalPrefix = plugin.importKey || plugin.resolve
  if (additionalPrefix) {
    const key = `${additionalPrefix}/${module}`
    pluginModuleCache.set(key, moduleObject)
  }
}

export async function importGatsbyPlugin(
  plugin: {
    name: string
    resolve: string
    resolvedCompiledGatsbyNode?: string
    importKey?: string
  },
  module: string
): Promise<any> {
  const key = `${plugin.importKey || plugin.resolve || plugin.name}/${module}`

  let pluginModule = pluginModuleCache.get(key)

  if (!pluginModule) {
    let importPluginModulePath: string

    if (module === `gatsby-node` && plugin.resolvedCompiledGatsbyNode) {
      importPluginModulePath = plugin.resolvedCompiledGatsbyNode
    } else {
      importPluginModulePath = `${plugin.resolve}/${module}`
    }

    const pluginFilePath = await resolveJSFilepath({
      rootDir: process.cwd(),
      filePath: importPluginModulePath,
    })

    const rawPluginModule = await import(maybeAddFileProtocol(pluginFilePath))

    // If the module is cjs, the properties we care about are nested under a top-level `default` property
    pluginModule = preferDefault(rawPluginModule)

    pluginModuleCache.set(key, pluginModule)
  }

  return pluginModule
}
