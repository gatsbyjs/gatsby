const fs = require(`fs-extra`)
const manager = require(`cache-manager`)
const fsStore = require(`cache-manager-fs`)
const path = require(`path`)

const MAX_CACHE_SIZE = 250

class Cache {
  constructor(folderName = `db`, store = fsStore) {
    this.folderName = folderName

    const caches = [
      { store: `memory`, max: MAX_CACHE_SIZE },
      {
        store,
        options: {
          path: this.directory,
        },
      },
    ].map(cache => manager.caching(cache))

    this.cache = manager.multiCaching(caches)
  }

  get directory() {
    return path.join(process.cwd(), `.cache/caches/${this.folderName}`)
  }

  init() {
    fs.ensureDirSync(this.directory)

    return this
  }

  get(key) {
    return this.cache.get(key)
  }

  set(key, value) {
    return this.cache.set(key, value)
  }
}

module.exports = Cache
