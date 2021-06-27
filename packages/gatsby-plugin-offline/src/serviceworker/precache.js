/* global importScripts, __GATSBY_PLUGIN_OFFLINE_SETTINGS */
import uniqBy from "lodash/uniqBy"
import { precacheAndRoute } from "workbox-precaching"
import { setCacheNameDetails } from "workbox-core"

importScripts(`%precachePageResourcesManifestPath%`)

export function precache() {
  if (__GATSBY_PLUGIN_OFFLINE_SETTINGS.cacheId) {
    setCacheNameDetails({
      prefix: __GATSBY_PLUGIN_OFFLINE_SETTINGS.cacheId,
    })
  }

  const precachePageResources =
    self.__GATSBY_PLUGIN_OFFLINE_PRECACHE_PAGE_RESOURCES || []

  const precachePaths = uniqBy(
    self.__WB_MANIFEST.concat(precachePageResources),
    `url`
  )

  precacheAndRoute(precachePaths, {
    directoryIndex: __GATSBY_PLUGIN_OFFLINE_SETTINGS.directoryIndex,
  })
}
