/* global __GATSBY_PLUGIN_OFFLINE_SETTINGS */
import * as idbKeyval from "idb-keyval"
import { cacheNames } from "workbox-core"
import { cleanupOutdatedCaches } from "workbox-precaching"

export function cleanup() {
  if (__GATSBY_PLUGIN_OFFLINE_SETTINGS.cleanupOutdatedCaches) {
    cleanupOutdatedCaches()
  }

  self.addEventListener(`activate`, async () => {
    try {
      const previousCachePrefix = await idbKeyval.get(`workbox-cache-prefix`)
      // cleanup caches if cache prefix changed
      if (
        previousCachePrefix &&
        previousCachePrefix !== cacheNames.prefix &&
        __GATSBY_PLUGIN_OFFLINE_SETTINGS.deletePreviousCacheVersionsOnUpdate
      ) {
        await Promise.all(
          (await caches.keys()).map(async key => {
            if (key.indexOf(previousCachePrefix) === 0) {
              await caches.delete(key)
            }
          })
        )
      }
      await idbKeyval.set(`workbox-cache-prefix`, cacheNames.prefix)
    } catch (e) {
      console.warn(`Failed to clean up previous caches`)
    }
  })
}
