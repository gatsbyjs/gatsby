/* global workbox */

self.addEventListener(`message`, event => {
  const { api } = event.data
  if (api === `gatsby-runtime-cache`) {
    const { resources } = event.data
    const cacheName = workbox.core.cacheNames.runtime

    event.waitUntil(
      caches.open(cacheName).then(cache =>
        Promise.all(
          resources.map(resource =>
            cache.add(resource).catch(e => {
              // ignore TypeErrors - these are usually due to
              // external resources which don't allow CORS
              if (!(e instanceof TypeError)) throw e
            })
          )
        )
      )
    )
  }
})
