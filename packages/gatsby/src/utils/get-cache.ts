import GatsbyCache from "./cache";

const caches = new Map<string, GatsbyCache>();

export function getCache(name: string): GatsbyCache {
  let cache = caches.get(name);
  if (!cache) {
    const GatsbyCacheLmdb = require("./cache-lmdb").default;
    cache = new GatsbyCacheLmdb({ name }).init() as GatsbyCache;
    caches.set(name, cache);
  }
  return cache;
}
