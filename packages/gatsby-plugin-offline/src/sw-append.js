/* global workbox */

self.addEventListener(`message`, event => {
  const { api } = event.data
  if (api === `gatsby-runtime-cache`) {
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
  }
})
