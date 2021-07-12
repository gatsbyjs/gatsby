import { open, RootDatabase, Database } from "lmdb-store"
import path from "path"

export class GatsbyCacheLmdb {
  private static store

  private static getStore(): RootDatabase {
    if (!GatsbyCacheLmdb.store) {
      const rootDbFile =
        process.env.NODE_ENV === `test`
          ? `caches-lmdb-${
              // FORCE_TEST_DATABASE_ID will be set if this gets executed in worker context
              // when running jest tests. JEST_WORKER_ID will be set when this gets executed directly
              // in test context (jest will use jest-worker internally).
              process.env.FORCE_TEST_DATABASE_ID ?? process.env.JEST_WORKER_ID
            }`
          : `caches-lmdb`

      GatsbyCacheLmdb.store = open({
        name: `root`,
        path: path.join(process.cwd(), `.cache/${rootDbFile}`),
        compression: true,
        maxDbs: 200,
      })
    }
    return GatsbyCacheLmdb.store
  }

  public readonly name: string
  private db: Database | undefined

  // @ts-ignore - set & get types are missing from fsStore?
  constructor({ name = `db` }: { name: string } = {}) {
    this.name = name
  }

  private getDb(): Database {
    if (!this.db) {
      this.db = GatsbyCacheLmdb.getStore().openDB({
        name: this.name,
      })
    }
    return this.db as Database
  }

  async get<T = unknown>(key): Promise<T | undefined> {
    return this.getDb().get(key)
  }

  async set<T>(key: string, value: T): Promise<T | undefined> {
    await this.getDb().put(key, value)
    return value
  }
}
