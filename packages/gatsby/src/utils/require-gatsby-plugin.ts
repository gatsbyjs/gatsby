const pluginModuleCache = new Map<string, unknown>()

export function setGatsbyPluginCache(
  plugin: { name: string; resolve: string },
  module: string,
  moduleObject: unknown
): void {
  const key = `${plugin.name}/${module}`
  pluginModuleCache.set(key, moduleObject)
}

export function requireGatsbyPlugin(
  plugin: {
    name: string
    resolve: string
    resolvedCompiledGatsbyNode?: string
  },
  module: string
): unknown {
  const key = `${plugin.name}/${module}`

  let pluginModule = pluginModuleCache.get(key)

  if (!pluginModule && process.env.GATSBY_IS_GRAPHQL_ENGINE) {
    return null
  }

  if (!pluginModule) {
    pluginModule = require(module === `gatsby-node` &&
      plugin.resolvedCompiledGatsbyNode
      ? plugin.resolvedCompiledGatsbyNode
      : `${plugin.resolve}/${module}`)
    pluginModuleCache.set(key, pluginModule)
  }
  return pluginModule
}
