/* global importScripts, workbox, idbKeyval */

importScripts(`idb-keyval-iife.min.js`)
const { NavigationRoute } = workbox.routing

const navigationRoute = new NavigationRoute(async ({ event }) => {
  let { pathname } = new URL(event.request.url)
  pathname = pathname.replace(new RegExp(`^%pathPrefix%`), ``)

  // Check for resources + the app-XXX.js file
  // The latter may not exist if the SW is updating to a new version
  const resources = await idbKeyval.get(`resources:${pathname}`)
  if (!resources || !(await caches.match(`%pathPrefix%/%appFile%`))) {
    return await fetch(event.request)
  }

  for (const resource of resources) {
    if (!(await caches.match(resource))) {
      return await fetch(event.request)
    }
  }

  const offlineShell = `%pathPrefix%/offline-plugin-app-shell-fallback/index.html`

  const content = await idbKeyval.get(`content:${pathname}`)
  if (content) {
    const { rootHTML, stylesheets } = content
    const links = stylesheets
      .map(stylesheet => `<link rel="stylesheet" href="${stylesheet}">`)
      .join(``)

    const response = await caches.match(offlineShell)
    const text = (await response.text())
      .replace(/(<!--\/gatsby-root--><\/div>)/, `$1` + links)
      .replace(/<!--gatsby-root-->.*<!--\/gatsby-root-->/, rootHTML)

    return new Response(text, { headers: { "Content-Type": `text/html` } })
  } else {
    return await caches.match(offlineShell)
  }
})

workbox.routing.registerRoute(navigationRoute)

const messageApi = {
  setPathResources(event, { path, resources }) {
    event.waitUntil(idbKeyval.set(`resources:${path}`, resources))
  },

  clearPathResources(event) {
    event.waitUntil(idbKeyval.clear())
  },

  storePageContent(event, { path, rootHTML, stylesheets }) {
    path = path.replace(new RegExp(`^%pathPrefix%`), ``)
    event.waitUntil(idbKeyval.set(`content:${path}`, { rootHTML, stylesheets }))
  },
}

self.addEventListener(`message`, event => {
  const { gatsbyApi } = event.data
  if (gatsbyApi) messageApi[gatsbyApi](event, event.data)
})
