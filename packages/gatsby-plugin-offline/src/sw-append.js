/* global importScripts, workbox, idbKeyval */

importScripts(`idb-keyval-iife.min.js`)
const WHITELIST_KEY = `custom-navigation-whitelist`

const navigationRoute = new workbox.routing.NavigationRoute(({ event }) => {
  const { pathname } = new URL(event.request.url)

  return idbKeyval.get(WHITELIST_KEY).then((customWhitelist = []) => {
    // Respond with the offline shell if we match the custom whitelist
    if (customWhitelist.includes(pathname)) {
      const offlineShell = `%pathPrefix%/offline-plugin-app-shell-fallback/index.html`
      const cacheName = workbox.core.cacheNames.precache

      return caches.match(offlineShell, { cacheName })
    }

    return fetch(event.request)
  })
})

workbox.routing.registerRoute(navigationRoute)

// Handle any other requests with Network First, e.g. 3rd party resources.
// This needs to be done last, otherwise it will prevent the custom navigation
// route from working (and any other rules).
workbox.routing.registerRoute(
  /^https?:/,
  workbox.strategies.networkFirst(),
  `GET`
)

let updatingWhitelist = null

function rawWhitelistPathnames(pathnames) {
  if (updatingWhitelist !== null) {
    // Prevent the whitelist from being updated twice at the same time
    return updatingWhitelist.then(() => rawWhitelistPathnames(pathnames))
  }

  updatingWhitelist = idbKeyval
    .get(WHITELIST_KEY)
    .then((customWhitelist = []) => {
      pathnames.forEach(pathname => {
        if (!customWhitelist.includes(pathname)) customWhitelist.push(pathname)
      })

      return idbKeyval.set(WHITELIST_KEY, customWhitelist)
    })
    .then(() => {
      updatingWhitelist = null
    })

  return updatingWhitelist
}

function rawResetWhitelist() {
  if (updatingWhitelist !== null) {
    return updatingWhitelist.then(() => rawResetWhitelist())
  }

  updatingWhitelist = idbKeyval.set(WHITELIST_KEY, []).then(() => {
    updatingWhitelist = null
  })

  return updatingWhitelist
}

const messageApi = {
  runtimeCache(event) {
    const { resources } = event.data
    const cacheName = workbox.core.cacheNames.runtime

    event.waitUntil(
      caches.open(cacheName).then(cache =>
        Promise.all(
          resources.map(resource => {
            let request

            // Some external resources don't allow
            // CORS so get an opaque response
            if (resource.match(/^https?:/)) {
              request = fetch(resource, { mode: `no-cors` })
            } else {
              request = fetch(resource)
            }

            return request.then(response => cache.put(resource, response))
          })
        )
      )
    )
  },

  whitelistPathnames(event) {
    let { pathnames } = event.data

    pathnames = pathnames.map(({ pathname, includesPrefix }) => {
      if (!includesPrefix) {
        return `%pathPrefix%${pathname}`
      } else {
        return pathname
      }
    })

    event.waitUntil(rawWhitelistPathnames(pathnames))
  },

  resetWhitelist(event) {
    event.waitUntil(rawResetWhitelist())
  },
}

self.addEventListener(`message`, event => {
  const { gatsbyApi } = event.data
  if (gatsbyApi) messageApi[gatsbyApi](event)
})
