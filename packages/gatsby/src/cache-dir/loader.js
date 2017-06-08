if (typeof window !== `undefined`) {
  require(`ric`)
}

import pageFinderFactor from "./find-page"
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
    return resourceStrCache[resourceName]
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

// TODO split this into two functions, one for fetching
// resource and the other for executing it.
// This prefetcher just sits around waiting for
// new resources to be added. When hears onPreLoadPageResources
// it stops until it hears onPostLoadPageResources
// actually, make it a state machine like thing that's listening
// to events and flipping it's state around.
//
// This is stupid complex. Need tests somehow.
// const prefetcher = () => {
// // Get top resource and start downloading it.
// const nextResource = resourcesArray.slice(-1)[0]
// if (nextResource) {
// console.log("prefetching next resource", nextResource)
// fetchResource(nextResource, (err, executeChunk) => {
// console.log("executeChunk", executeChunk)
// resourcesArray = resourcesArray.filter(r => r !== nextResource)
// setTimeout(() => {
// console.time(`execute resource`)
// const module = getResourceModule(nextResource)
// console.timeEnd(`execute resource`)
// console.log("module", module)
// prefetcher()
// }, 500)
// })
// } else {
// // Wait a second and try again
// setTimeout(() => prefetcher(), 1000)
// }
// }

// setTimeout(() => prefetcher(), 2500)

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
    findPage = pageFinderFactor(newPages)
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
        resourcesCount[page.jsonName] = 1
      } else {
        resourcesCount[page.jsonName] += 1
      }

      if (resourcesArray.indexOf(page.jsonName) === -1) {
        resourcesArray.unshift(page.jsonName)
      }
    }
    if (page.componentChunkName) {
      if (!resourcesCount[page.componentChunkName]) {
        resourcesCount[page.componentChunkName] = 1
      } else {
        resourcesCount[page.componentChunkName] += 1
      }

      if (resourcesArray.indexOf(page.componentChunkName) === -1) {
        resourcesArray.unshift(page.componentChunkName)
      }
    }

    // Sort resources by resourcesCount
    resourcesArray.sort(sortResourcesByCount)

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
    ___emitter.emit(`onPreLoadPageResources`, { path })
    // In development we know the code is loaded already
    // so we just return with it immediately.
    if (process.env.NODE_ENV !== `production`) {
      const page = findPage(path)
      const pageResources = {
        component: syncRequires.components[page.componentChunkName],
        json: syncRequires.json[page.jsonName],
      }
      ___emitter.emit(`onPostLoadPageResources`, { page, pageResources })
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
          pathScriptsCache[path] = { component, json }
          ___emitter.emit(`onPostLoadPageResources`, {
            page,
            pageResources: { component, json },
          })
        }
      }
      getResourceModule(page.componentChunkName, (err, c) => {
        if (err) {
          return console.log("we failed folks")
        }
        component = c
        done()
      })
      getResourceModule(page.jsonName, (err, j) => {
        if (err) {
          return console.log("we failed folks")
        }
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
