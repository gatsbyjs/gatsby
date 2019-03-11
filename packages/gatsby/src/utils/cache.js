const fs = require(`fs-extra`)
const manager = require(`cache-manager`)
const fsStore = require(`cache-manager-fs-hash`)
const path = require(`path`)

const MAX_CACHE_SIZE = 250
const TTL = Number.MAX_SAFE_INTEGER

function getCachePath(cwd) {
  const { GATSBY_CACHE } = process.env
  if (GATSBY_CACHE) {
    if (path.isAbsolute(GATSBY_CACHE)) {
      return GATSBY_CACHE
    }
    return path.join(cwd || process.cwd(), GATSBY_CACHE)
  }
  return path.join(cwd || process.cwd(), `./.cache`)
}

function cachePath(filePath, cwd) {
  return path.join(getCachePath(cwd), filePath)
}

class Cache {
  constructor({ name = `db`, store = fsStore } = {}) {
    this.name = name
    this.store = store
  }

  get directory() {
    return cachePath(`caches/${this.name}`)
  }

  get rootDirectory() {
    return getCachePath()
  }

  rootPath(filePath) {
    return cachePath(filePath)
  }

  init() {
    fs.ensureDirSync(this.directory)

    const caches = [
      {
        store: `memory`,
        max: MAX_CACHE_SIZE,
      },
      {
        store: this.store,
        options: {
          path: this.directory,
          ttl: TTL,
        },
      },
    ].map(cache => manager.caching(cache))

    this.cache = manager.multiCaching(caches)

    return this
  }

  get(key) {
    return new Promise(resolve => {
      this.cache.get(key, (err, res) => {
        resolve(err ? undefined : res)
      })
    })
  }

  set(key, value, args = {}) {
    return new Promise(resolve => {
      this.cache.set(key, value, args, err => {
        resolve(err ? undefined : value)
      })
    })
  }
}

module.exports = Cache
module.exports.getCachePath = getCachePath
module.exports.cachePath = cachePath
