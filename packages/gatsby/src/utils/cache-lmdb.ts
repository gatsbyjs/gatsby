import { open, RootDatabase, Database, DatabaseOptions } from "lmdb"
import * as fs from "fs-extra"
import * as path from "path"

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

const dbPath = path.join(
  global.__GATSBY?.root || process.cwd(),
  `.cache/${cacheDbFile}`
)

function getAlreadyOpenedStore(): RootDatabase | undefined {
  if (!globalThis.__GATSBY_OPEN_ROOT_LMDBS) {
    globalThis.__GATSBY_OPEN_ROOT_LMDBS = new Map()
  }
  return globalThis.__GATSBY_OPEN_ROOT_LMDBS.get(dbPath)
}

export default class GatsbyCacheLmdb {
  private db: Database | undefined
  private encoding: DatabaseOptions["encoding"]
  public readonly name: string
  // Needed for plugins that want to write data to the cache directory
  public readonly directory: string
  // TODO: remove `.cache` in v4. This is compat mode - cache-manager cache implementation
  // expose internal cache that gives access to `.del` function that wasn't available in public
  // cache interface (gatsby-plugin-sharp use it to clear no longer needed data)
  public readonly cache: GatsbyCacheLmdb

  constructor({
    name = `db`,
    encoding = `json`,
  }: {
    name: string
    encoding?: DatabaseOptions["encoding"]
  }) {
    this.name = name
    this.encoding = encoding
    this.directory = path.join(process.cwd(), `.cache/caches/${name}`)
    this.cache = this
  }

  init(): GatsbyCacheLmdb {
    fs.ensureDirSync(this.directory)
    return this
  }

  private static getStore(): RootDatabase {
    let rootDb = getAlreadyOpenedStore()
    if (rootDb) {
      return rootDb
    }

    rootDb = open({
      name: `root`,
      path: dbPath,
      compression: true,
      maxDbs: 200,
    })

    globalThis.__GATSBY_OPEN_ROOT_LMDBS.set(dbPath, rootDb)

    return rootDb
  }

  private getDb(): Database {
    if (!this.db) {
      this.db = GatsbyCacheLmdb.getStore().openDB({
        name: this.name,
        encoding: this.encoding,
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

  async del(key: string): Promise<void> {
    return this.getDb().remove(key) as unknown as Promise<void>
  }
}

export async function resetCache(): Promise<void> {
  const store = getAlreadyOpenedStore()
  if (store) {
    await store.close()
    globalThis.__GATSBY_OPEN_ROOT_LMDBS.delete(dbPath)
  }

  await fs.emptyDir(dbPath)
}
