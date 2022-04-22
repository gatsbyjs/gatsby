"use strict"

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault")

exports.__esModule = true
exports.default = void 0

var _lmdb = require("lmdb")

var _fsExtra = _interopRequireDefault(require("fs-extra"))

var _path = _interopRequireDefault(require("path"))

var _process$env$FORCE_TE

// Since the regular GatsbyCache saves to "caches" this should be "caches-lmdb"
const cacheDbFile =
  process.env.NODE_ENV === `test`
    ? `caches-lmdb-${
        // FORCE_TEST_DATABASE_ID will be set if this gets executed in worker context
        // when running jest tests. JEST_WORKER_ID will be set when this gets executed directly
        // in test context (jest will use jest-worker internally).
        (_process$env$FORCE_TE = process.env.FORCE_TEST_DATABASE_ID) !== null &&
        _process$env$FORCE_TE !== void 0
          ? _process$env$FORCE_TE
          : process.env.JEST_WORKER_ID
      }`
    : `caches-lmdb`

class GatsbyCacheLmdb {
  // Needed for plugins that want to write data to the cache directory
  // TODO: remove `.cache` in v4. This is compat mode - cache-manager cache implementation
  // expose internal cache that gives access to `.del` function that wasn't available in public
  // cache interface (gatsby-plugin-sharp use it to clear no longer needed data)
  constructor({ name = `db`, encoding = `json` }) {
    this.name = name
    this.encoding = encoding
    this.directory = _path.default.join(process.cwd(), `.cache/caches/${name}`)
    this.cache = this
  }

  init() {
    _fsExtra.default.ensureDirSync(this.directory)

    return this
  }

  static getStore() {
    if (!GatsbyCacheLmdb.store) {
      const path = _path.default.join(process.cwd(), `.cache/${cacheDbFile}`)
      console.log({ path })
      GatsbyCacheLmdb.store = (0, _lmdb.open)({
        name: `root`,
        path: _path.default.join(process.cwd(), `.cache/${cacheDbFile}`),
        compression: true,
        maxDbs: 200,
      })
    }

    return GatsbyCacheLmdb.store
  }

  getDb() {
    if (!this.db) {
      this.db = GatsbyCacheLmdb.getStore().openDB({
        name: this.name,
        encoding: this.encoding,
      })
    }

    return this.db
  }

  async get(key) {
    return this.getDb().get(key)
  }

  async set(key, value) {
    await this.getDb().put(key, value)
    return value
  }

  async del(key) {
    return this.getDb().remove(key)
  }
}

const cache = new GatsbyCacheLmdb({
  name: `internal-tmp-query-results`,
  encoding: `string`,
}).init()

;(async () => {
  const db = cache.getDb()
  await db.put(`test`, `wat`)
  const t = db.get(`test2`)
  console.log({ t })
  const keys = Array.from(db.getKeys())
  console.log({ keys })
  debugger
})()
