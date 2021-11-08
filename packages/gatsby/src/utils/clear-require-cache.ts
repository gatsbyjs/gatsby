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

  const parent = cacheEntry.parent
  if (parent) {
    const index = parent.children.findIndex(c => c.filename === resolvedModule)
    if (index !== -1) {
      parent.children.splice(index, 1)
    }
  }
  cacheEntry.children.forEach(module =>
    clearRequireCacheRecursively(module.filename, ignoreNodeModules)
  )
}
