exports.registerServiceWorker = () => true

let swNotInstalled = true
const pathnameResources = []

exports.onPrefetchPathname = ({ pathname, getResourcesForPathname }) => {
  // if SW is not installed, we need to record any prefetches
  // that happen so we can then add them to SW cache once installed
  if (swNotInstalled && `serviceWorker` in navigator) {
    pathnameResources.push(
      new Promise(resolve => {
        getResourcesForPathname(pathname, resources => {
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
  const nodes = document.querySelectorAll(
    `head > script[src], head > link[as=script]`
  )

  // get all script URLs
  const scripts = [].slice
    .call(nodes)
    .map(node => (node.src ? node.src : node.href))

  // loop over all resources and fetch the page component and JSON
  // thereby storing it in SW cache
  Promise.all(pathnameResources).then(pageResources => {
    pageResources.forEach(pageResource => {
      const [script] = scripts.filter(s =>
        s.includes(pageResource.page.componentChunkName)
      )
      fetch(pageResource.page.jsonURL)
      fetch(script)
    })
  })
}
