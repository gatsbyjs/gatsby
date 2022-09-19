import importFrom from "import-from"
import type { GatsbyCache } from "gatsby"

export function getCache(): GatsbyCache {
  if (global._polyfillRemoteFileCache) {
    return global._polyfillRemoteFileCache
  }
  // We need to use import-from to remove circular dependency
  const { getCache: getGatsbyCache } = importFrom(
    global.__GATSBY?.root ?? process.cwd(),
    `gatsby/dist/utils/get-cache`
  ) as { getCache: (key: string) => GatsbyCache }

  const cache = getGatsbyCache(`gatsby`)
  global._polyfillRemoteFileCache = cache
  return cache
}
