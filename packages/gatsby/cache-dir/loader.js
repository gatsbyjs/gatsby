import pageFinderFactory from "./find-page"
import emitter from "./emitter"


const preferDefault = m => (m && m.default) || m

let prefetcher
let inInitialRender = true
let hasFetched = Object.create(null)
let syncRequires = {}
let asyncRequires = {}

const fetchResource = (resourceName) => {
  // Find resource
  const resourceFunction =
    resourceName.startsWith(`component---`)
      ? asyncRequires.components[resourceName] ||
        asyncRequires.layouts[resourceName]
      : asyncRequires.json[resourceName]

  // Download the resource
  hasFetched[resourceName] = true
  return resourceFunction()
}

const getResourceModule = (resourceName) =>
  fetchResource(resourceName).then(preferDefault)

// Prefetcher logic
if (process.env.NODE_ENV === `production`) {
  prefetcher = require(`./prefetcher`)({
    fetchNextResource: () => {
      let next = queue.dequeue()
      return next && fetchResource(next)
    },
  })

  emitter.on(`onPreLoadPageResources`, e => {
    prefetcher.onPreLoadPageResources(e)
  })
  emitter.on(`onPostLoadPageResources`, e => {
    prefetcher.onPostLoadPageResources(e)
  })
}



// const sortPagesByCount = (a, b) => {
//   if (pathCount[a] > pathCount[b]) {
//     return 1
//   } else if (pathCount[a] < pathCount[b]) {
//     return -1
//   } else {
//     return 0
//   }
// }





// Note we're not actively using the path data atm. There
// could be future optimizations however around trying to ensure
// we load all resources for likely-to-be-visited paths.
// let pathArray = []
// let pathCount = {}

let resourcesCount = Object.create(null)
const sortResourcesByCount = (a, b) => {
  if (resourcesCount[a] > resourcesCount[b]) return 1
  else if (resourcesCount[a] < resourcesCount[b]) return -1
  else return 0
}


let findPage
let pages = []
let pathScriptsCache = {}
let resourcesArray = []
let mountOrder = 1

const queue = {
  empty: () => {
    // pathArray = []
    // pathCount = {}
    resourcesCount = Object.create(null)
    resourcesArray = []
    pages = []
  },

  addPagesArray: newPages => {
    pages = newPages
    let pathPrefix = ``
    if (typeof __PREFIX_PATHS__ !== `undefined`) {
      pathPrefix = __PATH_PREFIX__
    }
    findPage = pageFinderFactory(newPages, pathPrefix)
  },
  addDevRequires: devRequires => {
    syncRequires = devRequires
  },
  addProdRequires: prodRequires => {
    asyncRequires = prodRequires
  },

  dequeue: () => resourcesArray.pop(),

  // dequeue: path => pathArray.pop(),

  enqueue: path => {
    // Check page exists.
    if (!pages.some(p => p.path === path)) {
      return false
    }

    const mountOrderBoost = 1 / mountOrder
    mountOrder += 1

    function enqueueResource(resourceName) {
      if (!resourceName) return
      if (!resourcesCount[resourceName]) {
        resourcesCount[resourceName] = 1 + mountOrderBoost
      } else {
        resourcesCount[resourceName] += 1 + mountOrderBoost
      }

      // Before adding, checking that the resource isn't either
      // already queued or been downloading.
      if (hasFetched[resourceName] || resourcesArray.includes(resourceName))
        return

      resourcesArray.unshift(resourceName)
    }

    // console.log(
    // `enqueue "${path}", mountOrder: ${mountOrder}, mountOrderBoost: ${mountOrderBoost}`
    // )

    // Add to path counts.
    // if (!pathCount[path]) {
    //   pathCount[path] = 1
    // } else {
    //   pathCount[path] += 1
    // }

    // // Add path to queue.
    // if (!queue.has(path)) {
    //   pathArray.unshift(path)
    // }

    // // Sort pages by pathCount
    // pathArray.sort(sortPagesByCount)

    // Add resources to queue.
    const page = findPage(path)

    enqueueResource(page.jsonName)
    enqueueResource(page.componentChunkName)
    // console.log(resourcesArray, resourcesCount)
    // Sort resources by resourcesCount.
    resourcesArray.sort(sortResourcesByCount)

    if (process.env.NODE_ENV === `production`) {
      prefetcher.onNewResourcesAdded()
    }

    return true
  },

  getPage: pathname => findPage(pathname),

  getResourcesForPathname: (path, cb = () => {}) => {
    if (
      inInitialRender &&
      navigator &&
      navigator.serviceWorker &&
      navigator.serviceWorker.controller &&
      navigator.serviceWorker.controller.state === `activated`
    ) {
      // If we're loading from a service worker (it's already activated on
      // this initial render) and we can't find a page, there's a good chance
      // we're on a new page that this (now old) service worker doesn't know
      // about so we'll unregister it and reload.
      if (!findPage(path)) {
        navigator.serviceWorker
          .getRegistrations()
          .then(function(registrations) {
            for (let registration of registrations) {
              registration.unregister()
            }
            window.location.reload()
          })
      }
    }
    inInitialRender = false
    // In development we know the code is loaded already
    // so we just return with it immediately.
    if (process.env.NODE_ENV !== `production`) {
      const page = findPage(path)
      if (!page) return null

      const pageResources = {
        component: syncRequires.components[page.componentChunkName],
        json: syncRequires.json[page.jsonName],
        layout: syncRequires.layouts[page.layoutComponentChunkName],
        // page,
      }
      cb(pageResources)
      return pageResources

    }
    // Production code path
    const page = findPage(path)

    if (!page) {
      console.log(`A page wasn't found for "${path}"`)
      return null
    }

    // Use the path from the page so the pathScriptsCache uses
    // the normalized path.
    path = page.path

    // Check if it's in the cache already.
    if (pathScriptsCache[path]) {
      Promise.resolve().then(() => {
        cb(pathScriptsCache[path])
        emitter.emit(`onPostLoadPageResources`, {
          page,
          pageResources: pathScriptsCache[path],
        })
      })
      return pathScriptsCache[path]
    }

    emitter.emit(`onPreLoadPageResources`, { path })

    Promise.all([
      getResourceModule(page.componentChunkName),
      getResourceModule(page.jsonName),
      getResourceModule(page.layoutComponentChunkName),
    ])
    .then(([component, json, layout] )=> {
      const pageResources = { component, json, layout }

      pathScriptsCache[path] = pageResources
      cb(pageResources)

      emitter.emit(`onPostLoadPageResources`, {
        page,
        pageResources,
      })
    })

    return null
  },

  // for testing
  ___resources: () => resourcesArray.slice().reverse(),
}

module.exports = queue
