/* global importScripts, workbox, idbKeyval */

importScripts(
  `https://cdn.jsdelivr.net/npm/idb-keyval@3/dist/idb-keyval-iife.min.js`
)

const WHITELIST_KEY = `custom-navigation-whitelist`

const navigationRoute = new workbox.routing.NavigationRoute(({ event }) => {
  const { pathname } = new URL(event.request.url)
  console.log(`handling ${pathname}`)

  return idbKeyval.get(WHITELIST_KEY).then((customWhitelist = []) => {
    // Respond with the offline shell if we match the custom whitelist
    if (customWhitelist.includes(pathname)) {
      const offlineShell = `%pathPrefix%/offline-plugin-app-shell-fallback/index.html`
      const cacheName = workbox.core.cacheNames.precache

      console.log(`serving ${offlineShell} for ${pathname}`)
      return caches.match(offlineShell, { cacheName })
    }

    console.log(`fetching ${pathname} from network`)
    return fetch(event.request)
  })
})

workbox.routing.registerRoute(navigationRoute)

// Handle any other requests with Network First, e.g. 3rd party resources
workbox.routing.registerRoute(
  /^https?:/,
  workbox.strategies.networkFirst(),
  `GET`
)

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
    const { pathnames } = event.data

    event.waitUntil(
      idbKeyval.get(WHITELIST_KEY).then((customWhitelist = []) => {
        pathnames.forEach(({ pathname, includesPrefix }) => {
          if (!includesPrefix) {
            pathname = `%pathPrefix%${pathname}`
          }

          if (!customWhitelist.includes(pathname)) {
            console.log(`whitelisting ${pathname}`)
            customWhitelist.push(pathname)
          }
        })

        return idbKeyval.set(WHITELIST_KEY, customWhitelist)
      })
    )
  },
}

self.addEventListener(`message`, event => {
  const { gatsbyApi } = event.data
  if (gatsbyApi) messageApi[gatsbyApi](event)
})
