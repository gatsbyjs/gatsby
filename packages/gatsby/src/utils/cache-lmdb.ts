import { open, RootDatabase, Database } from "lmdb-store"
import fs from "fs-extra"
import path from "path"

// Since the regular GatsbyCache saves to "caches" this should be "caches-lmdb"
const cacheDbFile =
  process.env.NODE_ENV === `test`
    ? `caches-lmdb-${
        // FORCE_TEST_DATABASE_ID will be set if this gets executed in worker context
        // when running jest tests. JEST_WORKER_ID will be set when this gets executed directly
        // in test context (jest will use jest-worker internally).
        process.env.FORCE_TEST_DATABASE_ID ?? process.env.JEST_WORKER_ID
      }`
    : `caches-lmdb`

export default class GatsbyCacheLmdb {
  private static store
  private db: Database | undefined
  public readonly name: string
  // Needed for plugins that want to write data to the cache directory
  public readonly directory: string

  constructor({ name = `db` }: { name: string }) {
    this.name = name
    this.directory = path.join(process.cwd(), `.cache/caches/${name}`)
  }

  init(): GatsbyCacheLmdb {
    fs.ensureDirSync(this.directory)
    return this
  }

  private static getStore(): RootDatabase {
    if (!GatsbyCacheLmdb.store) {
      GatsbyCacheLmdb.store = open({
        name: `root`,
        path: path.join(process.cwd(), `.cache/${cacheDbFile}`),
        compression: true,
        maxDbs: 200,
      })
    }
    return GatsbyCacheLmdb.store
  }

  private getDb(): Database {
    if (!this.db) {
      this.db = GatsbyCacheLmdb.getStore().openDB({
        name: this.name,
      })
    }
    return this.db
  }

  async get<T = unknown>(key): Promise<T | undefined> {
    return this.getDb().get(key)
  }

  async set<T>(key: string, value: T): Promise<T | undefined> {
    await this.getDb().put(key, value)
    return value
  }
}
