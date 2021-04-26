import GatsbyCache from "./cache"

const caches = new Map<string, GatsbyCache>()

export const getCache = (name: string): GatsbyCache => {
  let cache = caches.get(name)
  if (!cache) {
    cache = new GatsbyCache({ name }).init()
    caches.set(name, cache)
  }
  return cache
}
