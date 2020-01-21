import manager, { Store, StoreConfig, CachingConfig } from "cache-manager"
import fs from "fs-extra"
import fsStore from "cache-manager-fs-hash"
import path from "path"

const MAX_CACHE_SIZE = 250
const TTL = Number.MAX_SAFE_INTEGER

interface ICacheProperties {
  name?: string
  store?: Store
}

export default class Cache {
  public name: string
  public store: Store
  public cache?: manager.Cache

  constructor({ name = `db`, store = fsStore }: ICacheProperties = {}) {
    this.name = name
    this.store = store
  }

  get directory(): string {
    return path.join(process.cwd(), `.cache/caches/${this.name}`)
  }

  init(): Cache {
    fs.ensureDirSync(this.directory)

    const configs: StoreConfig[] = [
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

  get<T = unknown>(key): Promise<T | undefined> {
    return new Promise(resolve => {
      if (!this.cache) {
        throw new Error(
          `Cache wasn't initialised yet, please run the init method first`
        )
      }
      this.cache.get<T>(key, (err, res) => {
        resolve(err ? undefined : res)
      })
    })
  }

  set<T>(
    key: string,
    value: T,
    args: CachingConfig = { ttl: TTL }
  ): Promise<T | undefined> {
    return new Promise(resolve => {
      if (!this.cache) {
        throw new Error(
          `Cache wasn't initialised yet, please run the init method first`
        )
      }
      this.cache.set(key, value, args, err => {
        resolve(err ? undefined : value)
      })
    })
  }
}
