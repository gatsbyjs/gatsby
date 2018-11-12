exports.registerServiceWorker = () => true

const prefetchedPathnames = []
const whitelistedPathnames = []

exports.onServiceWorkerActive = ({
  getResourceURLsForPathname,
  serviceWorker,
}) => {
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

  // Loop over all resources and fetch the page component and JSON
  // to add it to the sw cache.
  const prefetchedResources = []
  prefetchedPathnames.forEach(path =>
    getResourceURLsForPathname(path).forEach(resource =>
      prefetchedResources.push(resource)
    )
  )

  serviceWorker.active.postMessage({
    gatsbyApi: `runtimeCache`,
    resources: [...resources, ...prefetchedResources],
  })
  serviceWorker.active.postMessage({
    gatsbyApi: `whitelistPathnames`,
    pathnames: whitelistedPathnames,
  })
}

function whitelistPathname(pathname, includesPrefix) {
  if (`serviceWorker` in navigator) {
    const { serviceWorker } = navigator

    if (serviceWorker.controller !== null) {
      serviceWorker.controller.postMessage({
        gatsbyApi: `whitelistPathnames`,
        pathnames: [{ pathname, includesPrefix }],
      })
    } else {
      whitelistedPathnames.push({ pathname, includesPrefix })
    }
  }
}

exports.onRouteUpdate = ({ location }) =>
  whitelistPathname(location.pathname, true)

exports.onPostPrefetchPathname = ({ pathname }) => {
  whitelistPathname(pathname, false)

  // if SW is not installed, we need to record any prefetches
  // that happen so we can then add them to SW cache once installed
  if (
    `serviceWorker` in navigator &&
    !(
      navigator.serviceWorker.controller !== null &&
      navigator.serviceWorker.controller.state === `activated`
    )
  ) {
    console.log(`SERVICE WORKER NOT INSTALLED`)
    prefetchedPathnames.push(pathname)
  }
}
