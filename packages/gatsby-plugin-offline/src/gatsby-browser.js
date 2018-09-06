exports.registerServiceWorker = () => true

let swNotInstalled = true
const prefetchedPathnames = []

exports.onPrefetchPathname = ({ pathname }) => {
  // if SW is not installed, we need to record any prefetches
  // that happen so we can then add them to SW cache once installed
  if (swNotInstalled && `serviceWorker` in navigator) {
    prefetchedPathnames.push(pathname)
  }
}

exports.onServiceWorkerInstalled = ({ getResourceURLsForPathname }) => {
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

  // Loop over all resources and fetch the page component and JSON
  // to add it to the sw cache.
  prefetchedPathnames.forEach(path => {
    const { jsUrl, dataUrl } = getResourceURLsForPathname(path)
    fetch(jsUrl)
    fetch(dataUrl)
  })
}
