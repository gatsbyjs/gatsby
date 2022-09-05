import importFrom from "import-from"
import type { GatsbyCache } from "gatsby"

export function getCache(): GatsbyCache {
  if (global.polyfill_remote_file_cache) {
    return global.polyfill_remote_file_cache
  }
  // We need to use import-from to remove circular dependency
  const { getCache: getGatsbyCache } = importFrom(
    global.__GATSBY?.root ?? process.cwd(),
    `gatsby/dist/utils/get-cache`
  ) as { getCache: (key: string) => GatsbyCache }

  const cache = getGatsbyCache(`gatsby`)
  global.polyfill_remote_file_cache = cache
  return cache
}
