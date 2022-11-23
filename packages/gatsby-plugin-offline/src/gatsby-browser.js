exports.registerServiceWorker = () => process.env.GATSBY_IS_PREVIEW !== `true`

// only cache relevant resources for this page
const whiteListLinkRels = /^(stylesheet|preload)$/
const prefetchedPathnames = []

exports.onServiceWorkerActive = ({
  getResourceURLsForPathname,
  serviceWorker,
}) => {
  if (process.env.GATSBY_IS_PREVIEW === `true`) {
    return
  }

  // if the SW has just updated then clear the path dependencies and don't cache
  // stuff, since we're on the old revision until we navigate to another page
  if (window.___swUpdated) {
    serviceWorker.active.postMessage({ gatsbyApi: `clearPathResources` })
    return
  }

  // grab nodes from head of document
  const nodes = document.querySelectorAll(`
    head > script[src],
    head > link[href],
    head > style[data-href]
  `)

  // get all resource URLs
  const headerResources = [].slice
    .call(nodes)
    // don't include preconnect/prefetch/prerender resources
    .filter(
      node =>
        node.tagName !== `LINK` ||
        whiteListLinkRels.test(node.getAttribute(`rel`))
    )
    .map(node => node.src || node.href || node.getAttribute(`data-href`))

  // Loop over prefetched pages and add their resources to an array,
  // plus specify which resources are required for those paths.
  const prefetchedResources = []
  prefetchedPathnames.forEach(path => {
    const resources = getResourceURLsForPathname(path)
    prefetchedResources.push(...resources)

    serviceWorker.active.postMessage({
      gatsbyApi: `setPathResources`,
      path,
      resources,
    })
  })

  // Loop over all resources and fetch the page component + JSON data
  // to add it to the SW cache.
  const resources = [...headerResources, ...prefetchedResources]
  resources.forEach(resource => {
    // Create a prefetch link for each resource, so Workbox runtime-caches them
    const link = document.createElement(`link`)
    link.rel = `prefetch`
    link.href = resource

    link.onload = link.remove
    link.onerror = link.remove

    document.head.appendChild(link)
  })
}

function setPathResources(path, getResourceURLsForPathname) {
  // do nothing if the SW has just updated, since we still have old pages in
  // memory which we don't want to be whitelisted
  if (window.___swUpdated) return

  if (`serviceWorker` in navigator) {
    const { serviceWorker } = navigator

    if (serviceWorker.controller === null) {
      // if SW is not installed, we need to record any prefetches
      // that happen so we can then add them to SW cache once installed
      prefetchedPathnames.push(path)
    } else {
      const resources = getResourceURLsForPathname(path)
      serviceWorker.controller.postMessage({
        gatsbyApi: `setPathResources`,
        path,
        resources,
      })
    }
  }
}

exports.onRouteUpdate = ({ location, getResourceURLsForPathname }) => {
  const pathname = location.pathname.replace(__BASE_PATH__, ``)
  setPathResources(pathname, getResourceURLsForPathname)

  if (
    `serviceWorker` in navigator &&
    navigator.serviceWorker.controller !== null
  ) {
    navigator.serviceWorker.controller.postMessage({
      gatsbyApi: `enableOfflineShell`,
    })
  }
}

exports.onPostPrefetchPathname = ({ pathname, getResourceURLsForPathname }) => {
  setPathResources(pathname, getResourceURLsForPathname)
}
