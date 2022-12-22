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

export function requireGatsbyPlugin(
  plugin: {
    name: string
    resolve: string
    resolvedCompiledGatsbyNode?: string
    importKey?: string
  },
  module: string
): any {
  const key = `${plugin.importKey || plugin.resolve || plugin.name}/${module}`

  let pluginModule = pluginModuleCache.get(key)
  if (!pluginModule) {
    pluginModule = require(module === `gatsby-node` &&
      plugin.resolvedCompiledGatsbyNode
      ? plugin.resolvedCompiledGatsbyNode
      : `${plugin.resolve}/${module}`)
    pluginModuleCache.set(key, pluginModule)
  }
  return pluginModule
}
