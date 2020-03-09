import Cache from "./cache"

const caches = new Map<string, Cache>()

export const getCache = (name: string): Cache => {
  let cache = caches.get(name)
  if (!cache) {
    cache = new Cache({ name }).init()
    caches.set(name, cache)
  }
  return cache
}
