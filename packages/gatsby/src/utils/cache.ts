import manager, {
  Store,
  StoreConfig,
  CachingConfig,
  MultiCache,
} from "cache-manager"
import fs from "fs-extra"
import * as fsStore from "../cache/cache-fs"
import path from "path"

const MAX_CACHE_SIZE = 250
const TTL = Number.MAX_SAFE_INTEGER

interface ICacheProperties {
  name?: string
  store?: Store
}

export default class GatsbyCache {
  public name: string
  public store: Store
  public directory: string
  // TODO: remove `.cache` in v4. This is compat mode - cache-manager cache implementation
  // expose internal cache that gives access to `.del` function that wasn't available in public
  // cache interface (gatsby-plugin-sharp use it to clear no longer needed data)
  public cache?: MultiCache

  // @ts-ignore - set & get types are missing from fsStore?
  constructor({ name = `db`, store = fsStore }: ICacheProperties = {}) {
    this.name = name
    this.store = store
    this.directory = path.join(
      global.__GATSBY?.root ?? process.cwd(),
      `.cache`,
      `caches`,
      name
    )
  }

  init(): GatsbyCache {
    fs.ensureDirSync(this.directory)

    const configs: Array<StoreConfig> = [
      {
        store: `memory`,
        max: MAX_CACHE_SIZE,
        ttl: TTL,
      },
      {
        store: this.store,
        ttl: TTL,
        options: {
          path: this.directory,
          ttl: TTL,
        },
      },
    ]

    const caches = configs.map(cache => manager.caching(cache))

    this.cache = manager.multiCaching(caches)

    return this
  }

  async get<T = unknown>(key): Promise<T | undefined> {
    return new Promise(resolve => {
      if (!this.cache) {
        throw new Error(
          `GatsbyCache wasn't initialised yet, please run the init method first`
        )
      }
      this.cache.get<T>(key, (err, res) => {
        resolve(err ? undefined : res)
      })
    })
  }

  async set<T>(
    key: string,
    value: T,
    args: CachingConfig = { ttl: TTL }
  ): Promise<T | undefined> {
    return new Promise(resolve => {
      if (!this.cache) {
        throw new Error(
          `GatsbyCache wasn't initialised yet, please run the init method first`
        )
      }
      this.cache.set(key, value, args, err => {
        resolve(err ? undefined : value)
      })
    })
  }

  async del(key: string): Promise<void> {
    if (!this.cache) {
      throw new Error(
        `GatsbyCache wasn't initialised yet, please run the init method first`
      )
    }

    return this.cache.del(key)
  }
}
