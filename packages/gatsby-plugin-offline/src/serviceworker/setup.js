/* global __GATSBY_PLUGIN_OFFLINE_SETTINGS */
import { clientsClaim } from "workbox-core"
import { cleanupOutdatedCaches } from "workbox-precaching"

export function setup() {
  if (__GATSBY_PLUGIN_OFFLINE_SETTINGS.skipWaiting) {
    self.skipWaiting()
  } else {
    self.addEventListener(`message`, event => {
      if (event.data && event.data.type === `SKIP_WAITING`) {
        self.skipWaiting()
      }
    })
  }

  if (__GATSBY_PLUGIN_OFFLINE_SETTINGS.clientsClaim) {
    clientsClaim()
  }

  if (__GATSBY_PLUGIN_OFFLINE_SETTINGS.cleanupOutdatedCaches) {
    cleanupOutdatedCaches()
  }
}
