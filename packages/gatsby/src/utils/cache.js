const Promise = require(`bluebird`)
const fs = require(`fs-extra`)
const manager = require(`cache-manager`)
const fsStore = require(`cache-manager-fs`)
const path = require(`path`)

class Cache {
  constructor(folderName = `db`, store = fsStore) {
    this.folderName = folderName

    this.cache = manager.caching({
      store,
      promiseDependency: Promise,
      options: {
        path: this.directory,
      },
    })
  }

  get directory() {
    return path.join(process.cwd(), `.cache/${this.folderName}`)
  }

  async initCache() {
    await fs.ensureDir(this.directory)
  }

  get(key) {
    return this.cache.get(key)
  }

  set(key, value) {
    return this.cache.set(key, value)
  }
}

module.exports = new Cache()
module.exports.Cache = Cache
