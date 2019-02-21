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
    const { rootHTML, styleElements } = content

    const response = await caches.match(offlineShell)
    const text = (await response.text())
      // remove existing style elements
      .replace(/<style.*?>.*?<\/style>/g, ``)
      .replace(/<link .*?rel="stylesheet".*?>/g, ``)
      // insert the style elements in the head tag
      .replace(/(<\/head>)/, styleElements.join(``) + `$1`)
      // insert the root element HTML
      .replace(/<!--gatsby-root-->.*?<!--\/gatsby-root-->/, rootHTML)

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

  storePageContent(event, { path, rootHTML, styleElements }) {
    path = path.replace(new RegExp(`^%pathPrefix%`), ``)
    event.waitUntil(
      idbKeyval.set(`content:${path}`, { rootHTML, styleElements })
    )
  },
}

self.addEventListener(`message`, event => {
  const { gatsbyApi } = event.data
  if (gatsbyApi) messageApi[gatsbyApi](event, event.data)
})
