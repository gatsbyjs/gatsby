exports.registerServiceWorker = () => true

const prefetchedPathnames = []

exports.onServiceWorkerActive = ({
  getResourceURLsForPathname,
  serviceWorker,
}) => {
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
    .map(node => node.src || node.href || node.getAttribute(`data-href`))

  // Loop over all resources and fetch the page component and JSON
  // to add it to the sw cache.
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

exports.onRouteUpdate = ({ location }) => {
  if (
    !(`serviceWorker` in navigator) ||
    navigator.serviceWorker.controller === null
  ) {
    return
  }

  const styleElements = []

  // used to keep track of duplicates
  const linkedStyles = []
  const embeddedStyles = []

  Array.from(document.styleSheets).forEach(stylesheet => {
    const { ownerNode } = stylesheet
    const href = stylesheet.href || ownerNode.getAttribute(`data-href`)

    if (href) {
      if (linkedStyles.indexOf(href) === -1) {
        linkedStyles.push(href)
        styleElements.push(`<link rel="stylesheet" href="${href}" />`)
      }
    } else {
      const { rules } = stylesheet
      const cssText = Array.from(rules)
        .map(rule => rule.cssText)
        .join(``)

      if (embeddedStyles.indexOf(cssText) === -1) {
        embeddedStyles.push(cssText)
        styleElements.push(`<style>${cssText}</style>`)
      }
    }
  })

  navigator.serviceWorker.controller.postMessage({
    gatsbyApi: `storePageContent`,
    path: location.pathname,
    rootHTML: document.getElementById(`___gatsby`).innerHTML,
    styleElements,
  })
}

exports.onPostPrefetchPathname = ({ pathname, getResourceURLsForPathname }) => {
  // do nothing if the SW has just updated, since we still have old pages in
  // memory which we don't want to be whitelisted
  if (window.___swUpdated) return

  if (`serviceWorker` in navigator) {
    const { serviceWorker } = navigator

    if (serviceWorker.controller === null) {
      // if SW is not installed, we need to record any prefetches
      // that happen so we can then add them to SW cache once installed
      prefetchedPathnames.push(pathname)
    } else {
      serviceWorker.controller.postMessage({
        gatsbyApi: `setPathResources`,
        path: pathname,
        resources: getResourceURLsForPathname(pathname),
      })
    }
  }
}
