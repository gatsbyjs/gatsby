import React, { createElement } from "react"
import pageFinderFactory from "./find-page"
import emitter from "./emitter"
let findPage

let syncRequires = {}
let asyncRequires = {}
let pathScriptsCache = {}
let resourceStrCache = {}
let resourceCache = {}
let pages = []
// Note we're not actively using the path data atm. There
// could be future optimizations however around trying to ensure
// we load all resources for likely-to-be-visited paths.
let pathArray = []
let pathCount = {}
let resourcesArray = []
let resourcesCount = {}
const preferDefault = m => (m && m.default) || m
let prefetcher
let inInitialRender = true

// Prefetcher logic
if (process.env.NODE_ENV === `production`) {
  prefetcher = require(`./prefetcher`)({
    getNextQueuedResources: () => resourcesArray.slice(-1)[0],
    createResourceDownload: resourceName => {
      fetchResource(resourceName, () => {
        resourcesArray = resourcesArray.filter(r => r !== resourceName)
        prefetcher.onResourcedFinished(resourceName)
      })
    },
  })
  emitter.on(`onPreLoadPageResources`, e => {
    prefetcher.onPreLoadPageResources(e)
  })
  emitter.on(`onPostLoadPageResources`, e => {
    prefetcher.onPostLoadPageResources(e)
  })
}

const sortResourcesByCount = (a, b) => {
  if (resourcesCount[a] > resourcesCount[b]) {
    return 1
  } else if (resourcesCount[a] < resourcesCount[b]) {
    return -1
  } else {
    return 0
  }
}

const sortPagesByCount = (a, b) => {
  if (pathCount[a] > pathCount[b]) {
    return 1
  } else if (pathCount[a] < pathCount[b]) {
    return -1
  } else {
    return 0
  }
}

const fetchResource = (resourceName, cb = () => {}) => {
  if (resourceStrCache[resourceName]) {
    process.nextTick(() => {
      cb(null, resourceStrCache[resourceName])
    })
  } else {
    // Find resource
    const resourceFunction =
      resourceName.slice(0, 6) === `page-c`
        ? asyncRequires.components[resourceName] || asyncRequires.layouts[resourceName]
        : asyncRequires.json[resourceName]

    // Download the resource
    resourceFunction((err, executeChunk) => {
      resourceStrCache[resourceName] = executeChunk
      cb(err, executeChunk)
    })
  }
}

const getResourceModule = (resourceName, cb) => {
  if (resourceCache[resourceName]) {
    process.nextTick(() => {
      cb(null, resourceCache[resourceName])
    })
  } else {
    fetchResource(resourceName, (err, executeChunk) => {
      if (err) {
        cb(err)
      } else {
        const module = preferDefault(executeChunk())
        resourceCache[resourceName] = module
        cb(err, module)
      }
    })
  }
}

let mountOrder = 1
const queue = {
  empty: () => {
    pathArray = []
    pathCount = {}
    resourcesCount = {}
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
  dequeue: path => pathArray.pop(),
  enqueue: path => {
    // Check page exists.
    if (!pages.some(p => p.path === path)) {
      return false
    }

    const mountOrderBoost = 1 / mountOrder
    mountOrder += 1
    // console.log(
    // `enqueue "${path}", mountOrder: "${mountOrder}, mountOrderBoost: ${mountOrderBoost}`
    // )

    // Add to path counts.
    if (!pathCount[path]) {
      pathCount[path] = 1
    } else {
      pathCount[path] += 1
    }

    // Add path to queue.
    if (!queue.has(path)) {
      pathArray.unshift(path)
    }

    // Sort pages by pathCount
    pathArray.sort(sortPagesByCount)

    // Add resources to queue.
    const page = findPage(path)
    if (page.jsonName) {
      if (!resourcesCount[page.jsonName]) {
        resourcesCount[page.jsonName] = 1 + mountOrderBoost
      } else {
        resourcesCount[page.jsonName] += 1 + mountOrderBoost
      }

      // Before adding, checking that the JSON resource isn't either
      // already queued or been downloading.
      if (
        resourcesArray.indexOf(page.jsonName) === -1 &&
        !resourceStrCache[page.jsonName]
      ) {
        resourcesArray.unshift(page.jsonName)
      }
    }
    if (page.componentChunkName) {
      if (!resourcesCount[page.componentChunkName]) {
        resourcesCount[page.componentChunkName] = 1 + mountOrderBoost
      } else {
        resourcesCount[page.componentChunkName] += 1 + mountOrderBoost
      }

      // Before adding, checking that the component resource isn't either
      // already queued or been downloading.
      if (
        resourcesArray.indexOf(page.componentChunkName) === -1 &&
        !resourceStrCache[page.jsonName]
      ) {
        resourcesArray.unshift(page.componentChunkName)
      }
    }

    // Sort resources by resourcesCount.
    resourcesArray.sort(sortResourcesByCount)
    if (process.env.NODE_ENV === `production`) {
      prefetcher.onNewResourcesAdded()
    }

    return true
  },
  getResources: () => {
    return {
      resourcesArray,
      resourcesCount,
    }
  },
  getPages: () => {
    return {
      pathArray,
      pathCount,
    }
  },
  getPage: pathname => findPage(pathname),
  has: path => pathArray.some(p => p === path),
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
      if (!page) return
      const pageResources = {
        component: syncRequires.components[page.componentChunkName],
        json: syncRequires.json[page.jsonName],
        layout: syncRequires.layouts[page.layoutComponentChunkName]
      }
      cb(pageResources)
      return pageResources
      // Production code path
    } else {
      const page = findPage(path)

      if (!page) {
        console.log(`A page wasn't found for "${path}"`)
        return
      }

      // Use the path from the page so the pathScriptsCache uses
      // the normalized path.
      path = page.path

      // Check if it's in the cache already.
      if (pathScriptsCache[path]) {
        process.nextTick(() => {
          cb(pathScriptsCache[path])
          emitter.emit(`onPostLoadPageResources`, {
            page,
            pageResources: pathScriptsCache[path],
          })
        })
        return pathScriptsCache[path]
      }

      emitter.emit(`onPreLoadPageResources`, { path })
      // Nope, we need to load resource(s)
      let component
      let json
      let layout
      // Load the component/json/layout and parallel and call this
      // function when they're done loading. When both are loaded,
      // we move on.
      const done = () => {
        if (component && json && layout) {
          pathScriptsCache[path] = { component, json, layout }
          const pageResources = { component, json, layout }
          cb(pageResources)
          emitter.emit(`onPostLoadPageResources`, {
            page,
            pageResources,
          })
        }
      }
      getResourceModule(page.componentChunkName, (err, c) => {
        if (err) {
          console.log(`Loading the component for ${page.path} failed`)
        }
        component = c
        done()
      })
      getResourceModule(page.jsonName, (err, j) => {
        if (err) {
          console.log(`Loading the JSON for ${page.path} failed`)
        }
        json = j
        done()
      })

      getResourceModule(page.layoutComponentChunkName, (err, l) => {
        if (err) {
          console.log(`Loading the Layout for ${page.path} failed`)
        }
        layout = l
        done()
      })

      return undefined
    }
  },
  peek: path => pathArray.slice(-1)[0],
  length: () => pathArray.length,
  indexOf: path => pathArray.length - pathArray.indexOf(path) - 1,
}

module.exports = queue
