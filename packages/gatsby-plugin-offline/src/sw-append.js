/* global importScripts, workbox, idbKeyval */

importScripts(`idb-keyval-iife.min.js`)
const { NavigationRoute } = workbox.routing

const navigationRoute = new NavigationRoute(async ({ event }) => {
  let { pathname } = new URL(event.request.url)
  pathname = pathname.replace(`%pathPrefix%`, ``)

  const resources = await idbKeyval.get(`resources:${pathname}`)
  console.log(`trying resources:${pathname}`)

  // Check for resources + the app-XXX.js file
  // The latter may not exist if the SW is updating to a new version
  if (!resources || !(await caches.match(`%pathPrefix%/%appFile%`))) {
    console.log(`nothing`)
    return await fetch(event.request)
  }

  for (const resource of resources) {
    console.log(`testing resource`, resource)
    if (!(await caches.match(resource))) {
      console.log(`missing resource so serving the file directly`)
      return await fetch(event.request)
    }
  }

  console.log(`all succeeded! serving offline shell`)
  const offlineShell = `%pathPrefix%/offline-plugin-app-shell-fallback/index.html`
  return await caches.match(offlineShell)
})

workbox.routing.registerRoute(navigationRoute)

const messageApi = {
  setPathResources(event, { path, resources }) {
    event.waitUntil(idbKeyval.set(`resources:${path}`, resources))
  },

  clearPathResources(event) {
    event.waitUntil(idbKeyval.clear())
  },
}

self.addEventListener(`message`, event => {
  const { gatsbyApi } = event.data
  if (gatsbyApi) messageApi[gatsbyApi](event, event.data)
})
