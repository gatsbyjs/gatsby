export function clearRequireCacheRecursively(
  module: string,
  ignoreNodeModules: boolean = true
): void {
  const resolvedModule = require.resolve(module)
  const cacheEntry = require.cache[resolvedModule]
  if (!cacheEntry) {
    return
  }
  if (ignoreNodeModules && resolvedModule.includes(`node_modules`)) {
    return
  }
  delete require.cache[resolvedModule]

  cacheEntry.children.forEach(module =>
    clearRequireCacheRecursively(module.filename, ignoreNodeModules)
  )
}
