exports.registerServiceWorker = () => true

let swNotInstalled = true
const pathnameResources = []

exports.onPrefetchPathname = ({ pathname, getResourcesForPathname }) => {
  // if SW is not installed, we need to record any prefetches
  // that happen so we can then add them to SW cache once installed
  if (swNotInstalled && `serviceWorker` in navigator) {
    pathnameResources.push(
      new Promise(resolve => {
        getResourcesForPathname(pathname).then(resources => {
          resolve(resources)
        })
      })
    )
  }
}

exports.onServiceWorkerInstalled = () => {
  // stop recording prefetch events
  swNotInstalled = false

  // grab nodes from head of document
  const nodes = document.querySelectorAll(`
    head > script[src],
    head > link[as=script],
    head > link[rel=stylesheet],
    head > style[data-href]
  `)

  // get all resource URLs
  const resources = [].slice
    .call(nodes)
    .map(node => node.src || node.href || node.getAttribute(`data-href`))

  for (const resource of resources) {
    fetch(resource)
  }

  // loop over all resources and fetch the page component and JSON
  // thereby storing it in SW cache
  Promise.all(pathnameResources).then(pageResources => {
    for (const pageResource of pageResources) {
      if (pageResource) fetch(pageResource.page.jsonURL)
    }
  })
}
