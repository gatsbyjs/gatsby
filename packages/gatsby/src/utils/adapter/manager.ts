import { store, readState } from "../../redux"
import reporter from "gatsby-cli/lib/reporter"
import adapterFn from "./adapter-demo"

interface IAdapterManager {
  restoreCache: () => Promise<void>
  storeCache: () => Promise<void>
}

export function initAdapterManager(): IAdapterManager {
  const directories = [`.cache`, `public`]

  const adapter = adapterFn({ reporter })

  reporter.info(`[dev-adapter-manager] using an adapter`)

  return {
    restoreCache: async (): Promise<void> => {
      reporter.info(`[dev-adapter-manager] restoreCache()`)
      if (!adapter.cache) {
        return
      }

      const result = await adapter.cache.restore(directories)
      if (result === false) {
        // if adapter reports `false`, we can skip trying to re-hydrate state
        return
      }

      const cachedState = readState()

      if (Object.keys(cachedState).length > 0) {
        store.dispatch({
          type: `RESTORE_CACHE`,
          payload: cachedState,
        })
      }
    },
    storeCache: async (): Promise<void> => {
      reporter.info(`[dev-adapter-manager] storeCache()`)
      if (!adapter.cache) {
        return
      }

      await adapter.cache.store(directories)
    },
  }
}
