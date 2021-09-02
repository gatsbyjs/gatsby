const pluginModuleCache = new Map<string, any>()

export function setGatsbyPluginCache(
  plugin: { name: string; resolve: string },
  module: string,
  moduleObject: any
) {
  const key = `${plugin.name}/${module}`
  console.log(`Setting module: ${key}`)
  pluginModuleCache.set(key, moduleObject)
}

export function requireGatsbyPlugin(
  plugin: { name: string; resolve: string },
  module: string
): any {
  const key = `${plugin.name}/${module}`

  let pluginModule = pluginModuleCache.get(key)
  if (!pluginModule) {
    pluginModule = require(`${plugin.resolve}/${module}`)
    pluginModuleCache.set(key, pluginModule)
  }
  return pluginModule
}
