import { resolveJSFilepath } from "../bootstrap/resolve-js-file-path"
import { preferDefault } from "../bootstrap/prefer-default"
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

    const pluginFilePath = await resolveJSFilepath({
      rootDir: process.cwd(),
      filePath: importPluginModulePath,
    })

    const rawPluginModule = await import(pathToFileURL(pluginFilePath).href)

    // If the module is cjs, the properties we care about are nested under a top-level `default` property
    pluginModule = preferDefault(rawPluginModule)

    pluginModuleCache.set(key, pluginModule)
  }

  return pluginModule
}
