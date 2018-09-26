const fs = require(`fs-extra`)
const manager = require(`cache-manager`)
const fsStore = require(`cache-manager-fs`)
const path = require(`path`)

const MAX_CACHE_SIZE = 250
const ONE_HOUR = 60 * 60

class Cache {
  constructor(folderName = `db`, store = fsStore) {
    this.folderName = folderName
    this.store = store
  }

  get directory() {
    return path.join(process.cwd(), `.cache/caches/${this.folderName}`)
  }

  init() {
    fs.ensureDirSync(this.directory)

    const caches = [
      { store: `memory`, max: MAX_CACHE_SIZE },
      {
        store: this.store,
        options: {
          path: this.directory,
          ttl: ONE_HOUR,
        },
      },
    ].map(cache => manager.caching(cache))

    this.cache = manager.multiCaching(caches)

    return this
  }

  get(key) {
    return new Promise(resolve => {
      this.cache.get(key, (_, res) => resolve(res))
    })
  }

  set(key, value, args = {}) {
    return new Promise(resolve => {
      this.cache.set(key, value, args, (_, res) => resolve(res))
    })
  }
}

module.exports = Cache
