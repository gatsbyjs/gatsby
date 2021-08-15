import GatsbyCache from "./cache"
import { isLmdbStore } from "../datastore"

const caches = new Map<string, GatsbyCache>()

export const getCache = (name: string): GatsbyCache => {
  let cache = caches.get(name)
  if (!cache) {
    if (isLmdbStore()) {
      const GatsbyCacheLmdb = require(`./cache-lmdb`).default
      cache = new GatsbyCacheLmdb({ name }).init() as GatsbyCache
    } else {
      cache = new GatsbyCache({ name }).init()
    }
    caches.set(name, cache)
  }
  return cache
}
