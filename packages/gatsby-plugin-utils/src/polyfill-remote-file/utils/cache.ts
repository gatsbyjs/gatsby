import importFrom from "import-from";
// import type { GatsbyCache } from "gatsby";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getCache(): any {
  if (global._polyfillRemoteFileCache) {
    return global._polyfillRemoteFileCache;
  }
  // We need to use import-from to remove circular dependency
  const { getCache: getGatsbyCache } = importFrom(
    global.__GATSBY?.root ?? process.cwd(),
    "gatsby/dist/utils/get-cache",
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ) as { getCache: (key: string) => any };

  const cache = getGatsbyCache("gatsby");
  global._polyfillRemoteFileCache = cache;
  return cache;
}
