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

// Prefetcher logic
const prefetcher = require(`./prefetcher`)({
  getNextQueuedResources: () => resourcesArray.slice(-1)[0],
  createResourceDownload: resourceName => {
    console.log("fetching resource:", resourceName)
    console.log(`resourcesArray length`, resourcesArray.length)
    fetchResource(resourceName, () => {
      resourcesArray = resourcesArray.filter(r => r !== resourceName)
      console.log(`resourcesArray length`, resourcesArray.length)
      prefetcher.onResourcedFinished(resourceName)
      console.log(`resourceStrCache`, resourceStrCache)
      console.log(`resourceCache`, resourceCache)
    })
  },
})
emitter.on(`ON_PRE_LOAD_PAGE_RESOURCES`, e => {
  console.log(`ON_PRE_LOAD_PAGE_RESOURCES`, e)
  prefetcher.onPreLoadPageResources(e)
})
emitter.on(`ON_POST_LOAD_PAGE_RESOURCES`, e => {
  console.log(`ON_POST_LOAD_PAGE_RESOURCES`, e)
  prefetcher.onPostLoadPageResources(e)
})

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
    return cb(null, resourceStrCache[resourceName])
  } else {
    // Find resource
    const resourceFunction = resourceName.slice(0, 6) === `page-c`
      ? asyncRequires.components[resourceName]
      : asyncRequires.json[resourceName]

    // Download the resource
    console.time(`download resource ${resourceName}`)
    resourceFunction((err, executeChunk) => {
      console.timeEnd(`download resource ${resourceName}`)
      resourceStrCache[resourceName] = executeChunk
      cb(err, executeChunk)
    })
  }
}

const getResourceModule = (resourceName, cb) => {
  console.log(`getting resourceName`, resourceName)
  if (resourceCache[resourceName]) {
    return cb(null, resourceCache[resourceName])
  } else {
    fetchResource(resourceName, (err, executeChunk) => {
      if (err) {
        cb(err)
      } else {
        console.time(`execute chunk ${resourceName}`)
        const module = preferDefault(executeChunk())
        console.timeEnd(`execute chunk ${resourceName}`)
        resourceCache[resourceName] = module
        return cb(err, module)
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
    let linkPrefix = ``
    if (__PREFIX_LINKS__) {
      linkPrefix = __LINK_PREFIX__
    }
    findPage = pageFinderFactory(newPages, linkPrefix)
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

    // Add resources.
    const page = findPage(path)
    if (page.jsonName) {
      if (!resourcesCount[page.jsonName]) {
        resourcesCount[page.jsonName] = 1 + mountOrderBoost
      } else {
        resourcesCount[page.jsonName] += 1 + mountOrderBoost
      }

      // Before adding checking that the JSON resource isn't either
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

      // Before adding checking that the component resource isn't either
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
    prefetcher.onNewResourcesAdded()

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
  hasPage: pathname => findPage(pathname),
  has: path => pathArray.some(p => p === path),
  getResourcesForPathname: path => {
    emitter.emit(`onPreLoadPageResources`, { path })
    // In development we know the code is loaded already
    // so we just return with it immediately.
    if (process.env.NODE_ENV !== `production`) {
      const page = findPage(path)
      const pageResources = {
        component: syncRequires.components[page.componentChunkName],
        json: syncRequires.json[page.jsonName],
      }
      console.log(`EMITTING onPostLoadPageResources`, page, pageResources)
      emitter.emit(`onPostLoadPageResources`, { page, pageResources })
      return pageResources
    } else {
      // Check if it's in the cache already.
      if (pathScriptsCache[path]) {
        return pathScriptsCache[path]
      }
      console.log("need to load scripts")
      const page = findPage(path)
      console.log("for page", page)
      let component
      let json
      const done = () => {
        if (component && json) {
          console.log("done loading")
          pathScriptsCache[path] = { component, json }
          const pageResources = { component, json }
          console.log(`EMITTING onPostLoadPageResources`, page, pageResources)
          emitter.emit(`onPostLoadPageResources`, {
            page,
            pageResources,
          })
        }
      }
      getResourceModule(page.componentChunkName, (err, c) => {
        if (err) {
          return console.log("we failed folks")
        }
        console.log("done getting component")
        component = c
        done()
      })
      getResourceModule(page.jsonName, (err, j) => {
        if (err) {
          return console.log("we failed folks")
        }
        console.log("done getting json")
        json = j
        done()
      })
    }
  },
  peek: path => pathArray.slice(-1)[0],
  length: () => pathArray.length,
  indexOf: path => pathArray.length - pathArray.indexOf(path) - 1,
}

module.exports = queue
