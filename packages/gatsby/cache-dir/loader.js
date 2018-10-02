import pageFinderFactory from "./find-page"
import emitter from "./emitter"
import stripPrefix from "./strip-prefix"
import prefetchHelper from "./prefetch"

const preferDefault = m => (m && m.default) || m

let prefetcher
let devGetPageData
let inInitialRender = true
let hasFetched = Object.create(null)
let syncRequires = {}
let asyncRequires = {}
let jsonDataPaths = {}
let fetchHistory = []
let fetchingPageResourceMapPromise = null
let fetchedPageResourceMap = false
let apiRunner
const failedPaths = {}
const failedResources = {}
const MAX_HISTORY = 5

const jsonPromiseStore = {}

if (process.env.NODE_ENV !== `production`) {
  devGetPageData = require(`./socketIo`).getPageData
}

/**
 * Fetch resource map (pages data and paths to json files with results of
 *  queries)
 */
const fetchPageResourceMap = () => {
  if (!fetchingPageResourceMapPromise) {
    fetchingPageResourceMapPromise = new Promise(resolve => {
      asyncRequires.data().then(({ pages, dataPaths }) => {
        // TODO — expose proper way to access this data from plugins.
        // Need to come up with an API for plugins to access
        // site info.
        window.___dataPaths = dataPaths
        queue.addPagesArray(pages)
        queue.addDataPaths(dataPaths)
        resolve((fetchedPageResourceMap = true))
      })
    })
  }
  return fetchingPageResourceMapPromise
}

const createJsonURL = jsonName => `${__PATH_PREFIX__}/static/d/${jsonName}.json`
const createComponentUrls = componentChunkName =>
  window.___chunkMapping[componentChunkName].map(
    chunk => __PATH_PREFIX__ + chunk
  )

const fetchResource = resourceName => {
  // Find resource
  let resourceFunction
  if (resourceName.slice(0, 12) === `component---`) {
    resourceFunction = asyncRequires.components[resourceName]
  } else {
    if (resourceName in jsonPromiseStore) {
      resourceFunction = () => jsonPromiseStore[resourceName]
    } else {
      resourceFunction = () => {
        const fetchPromise = new Promise((resolve, reject) => {
          const url = createJsonURL(jsonDataPaths[resourceName])
          const req = new XMLHttpRequest()
          req.open(`GET`, url, true)
          req.withCredentials = true
          req.onreadystatechange = () => {
            if (req.readyState == 4) {
              if (req.status === 200) {
                resolve(JSON.parse(req.responseText))
              } else {
                reject()
              }
            }
          }
          req.send(null)
        })
        jsonPromiseStore[resourceName] = fetchPromise
        return fetchPromise
      }
    }
  }

  // Download the resource
  hasFetched[resourceName] = true
  return new Promise(resolve => {
    const fetchPromise = resourceFunction()
    let failed = false
    return fetchPromise
      .catch(() => {
        failed = true
      })
      .then(component => {
        fetchHistory.push({
          resource: resourceName,
          succeeded: !failed,
        })

        if (!failedResources[resourceName]) {
          failedResources[resourceName] = failed
        }

        fetchHistory = fetchHistory.slice(-MAX_HISTORY)

        resolve(component)
      })
  })
}

const prefetchResource = resourceName => {
  if (resourceName.slice(0, 12) === `component---`) {
    createComponentUrls(resourceName).forEach(url => prefetchHelper(url))
  } else {
    const url = createJsonURL(jsonDataPaths[resourceName])
    prefetchHelper(url)
  }
}

const getResourceModule = resourceName =>
  fetchResource(resourceName).then(preferDefault)

const appearsOnLine = () => {
  const isOnLine = navigator.onLine
  if (typeof isOnLine === `boolean`) {
    return isOnLine
  }

  // If no navigator.onLine support assume onLine if any of last N fetches succeeded
  const succeededFetch = fetchHistory.find(entry => entry.succeeded)
  return !!succeededFetch
}

const handleResourceLoadError = (path, message) => {
  if (!failedPaths[path]) {
    failedPaths[path] = message
  }

  if (
    appearsOnLine() &&
    window.location.pathname.replace(/\/$/g, ``) !== path.replace(/\/$/g, ``)
  ) {
    window.location.pathname = path
  }
}

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
let pathScriptsCache = {}
let prefetchTriggered = {}
let disableCorePrefetching = false

const queue = {
  addPagesArray: newPages => {
    findPage = pageFinderFactory(newPages, __PATH_PREFIX__)
  },
  addDevRequires: devRequires => {
    syncRequires = devRequires
  },
  addProdRequires: prodRequires => {
    asyncRequires = prodRequires
  },
  addDataPaths: dataPaths => {
    jsonDataPaths = dataPaths
  },
  // Hovering on a link is a very strong indication the user is going to
  // click on it soon so let's start prefetching resources for this
  // pathname.
  hovering: rawPath => {
    const path = stripPrefix(rawPath, __PATH_PREFIX__)
    queue.getResourcesForPathname(path)
  },
  enqueue: rawPath => {
    const path = stripPrefix(rawPath, __PATH_PREFIX__)
    if (!apiRunner)
      console.error(`Run setApiRunnerForLoader() before enqueing paths`)

    // Tell plugins with custom prefetching logic that they should start
    // prefetching this path.
    if (!prefetchTriggered[path]) {
      apiRunner(`onPrefetchPathname`, {
        pathname: path,
      })
      prefetchTriggered[path] = true
    }

    // If a plugin has disabled core prefetching, stop now.
    if (disableCorePrefetching.some(a => a)) {
      return false
    }

    // Check if the page exists.
    let page = findPage(path)

    // In production, we lazy load page metadata. If that
    // hasn't been fetched yet, start fetching it now.
    if (
      process.env.NODE_ENV === `production` &&
      !page &&
      !fetchedPageResourceMap
    ) {
      // If page wasn't found check and we didn't fetch resources map for
      // all pages, wait for fetch to complete and try find page again
      return fetchPageResourceMap().then(() => queue.enqueue(rawPath))
    }

    if (!page) {
      return false
    }

    if (
      process.env.NODE_ENV !== `production` &&
      process.env.NODE_ENV !== `test`
    ) {
      devGetPageData(page.path)
    }

    // Prefetch resources.
    if (process.env.NODE_ENV === `production`) {
      prefetchResource(page.jsonName)
      prefetchResource(page.componentChunkName)
    }

    return true
  },

  getPage: pathname => findPage(pathname),

  getResourceURLsForPathname: path => {
    const page = findPage(path)
    if (page) {
      return [
        ...createComponentUrls(page.componentChunkName),
        createJsonURL(jsonDataPaths[page.jsonName]),
      ]
    } else {
      return null
    }
  },

  getResourcesForPathnameSync: path => {
    const page = findPage(path)
    if (page) {
      return pathScriptsCache[page.path]
    } else if (path !== `/404.html`) {
      return queue.getResourcesForPathnameSync(`/404.html`)
    } else {
      return null
    }
  },

  // Get resources (code/data) for a path. Fetches metdata first
  // if necessary and then the code/data bundles. Used for prefetching
  // and getting resources for page changes.
  getResourcesForPathname: path =>
    new Promise((resolve, reject) => {
      const doingInitialRender = inInitialRender
      inInitialRender = false

      // Production code path
      if (failedPaths[path]) {
        handleResourceLoadError(
          path,
          `Previously detected load failure for "${path}"`
        )
        return reject()
      }
      const page = findPage(path)

      // In production, we lazy load page metadata. If that
      // hasn't been fetched yet, start fetching it now.
      if (
        !page &&
        !fetchedPageResourceMap &&
        process.env.NODE_ENV === `production`
      ) {
        // If page wasn't found check and we didn't fetch resources map for
        // all pages, wait for fetch to complete and try to get resources again
        return fetchPageResourceMap().then(() =>
          resolve(queue.getResourcesForPathname(path))
        )
      }

      if (!page) {
        console.log(`A page wasn't found for "${path}"`)

        // Preload the custom 404 page
        if (path !== `/404.html`) {
          return resolve(queue.getResourcesForPathname(`/404.html`))
        }

        return resolve()
      }

      // Use the path from the page so the pathScriptsCache uses
      // the normalized path.
      path = page.path

      // Check if it's in the cache already.
      if (pathScriptsCache[path]) {
        emitter.emit(`onPostLoadPageResources`, {
          page,
          pageResources: pathScriptsCache[path],
        })
        return resolve(pathScriptsCache[path])
      }

      // Nope, we need to load resource(s)
      emitter.emit(`onPreLoadPageResources`, {
        path,
      })

      // In development we know the code is loaded already
      // so we just return with it immediately.
      if (process.env.NODE_ENV !== `production`) {
        const pageResources = {
          component: syncRequires.components[page.componentChunkName],
          page,
        }

        // Add to the cache.
        pathScriptsCache[path] = pageResources
        devGetPageData(page.path).then(pageData => {
          emitter.emit(`onPostLoadPageResources`, {
            page,
            pageResources,
          })
          resolve(pageResources)
        })
      } else {
        Promise.all([
          getResourceModule(page.componentChunkName),
          getResourceModule(page.jsonName),
        ]).then(([component, json]) => {
          if (!(component && json)) {
            resolve(null)
            return
          }

          const pageResources = {
            component,
            json,
            page,
          }
          pageResources.page.jsonURL = createJsonURL(
            jsonDataPaths[page.jsonName]
          )
          pathScriptsCache[path] = pageResources
          resolve(pageResources)

          emitter.emit(`onPostLoadPageResources`, {
            page,
            pageResources,
          })

          if (doingInitialRender) {
            // We got all resources needed for first mount,
            // we can fetch resoures for all pages.
            fetchPageResourceMap()
          }
        })
      }
    }),
}

export const setApiRunnerForLoader = runner => {
  apiRunner = runner
  disableCorePrefetching = apiRunner(`disableCorePrefetching`)
}

export const publicLoader = {
  getResourcesForPathname: queue.getResourcesForPathname,
  getResourceURLsForPathname: queue.getResourceURLsForPathname,
  getResourcesForPathnameSync: queue.getResourcesForPathnameSync,
}

export default queue
