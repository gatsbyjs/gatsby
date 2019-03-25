import emitter from "./emitter"
import prefetchHelper from "./prefetch"
import { match } from "@reach/router/lib/utils"
import stripPrefix from "./strip-prefix"
import matchPaths from "./match-paths.json"

const preferDefault = m => (m && m.default) || m

let devGetPageData
let syncRequires = {}
let asyncRequires = {}
let fetchHistory = []

// /**
//  * Indicate if pages manifest is loaded
//  *  - in production it is split to separate "pages-manifest" chunk that need to be lazy loaded,
//  *  - in development it is part of single "common" chunk and is available from the start.
//  */
// let hasPageGlobals = process.env.NODE_ENV !== `production`
let apiRunner
const failedPaths = {}
const MAX_HISTORY = 5

const fetchedPageData = {}
const pageDatas = {}
const fetchPromiseStore = {}

if (process.env.NODE_ENV !== `production`) {
  devGetPageData = require(`./socketIo`).getPageData
}

const pathCache = {}

const findPath = rawPathname => {
  let pathname = decodeURIComponent(rawPathname)
  // Remove the pathPrefix from the pathname.
  let trimmedPathname = stripPrefix(pathname, __PATH_PREFIX__)
  // Remove any hashfragment
  if (trimmedPathname.split(`#`).length > 1) {
    trimmedPathname = trimmedPathname
      .split(`#`)
      .slice(0, -1)
      .join(``)
  }

  // Remove search query
  if (trimmedPathname.split(`?`).length > 1) {
    trimmedPathname = trimmedPathname
      .split(`?`)
      .slice(0, -1)
      .join(``)
  }
  if (pathCache[trimmedPathname]) {
    return pathCache[trimmedPathname]
  }

  let foundPath
  Object.keys(matchPaths).some(matchPath => {
    if (match(matchPath, trimmedPathname)) {
      foundPath = matchPaths[matchPath]
      return foundPath
    }
    // Finally, try and match request with default document.
    if (trimmedPathname === `/index.html`) {
      foundPath = `/`
      return foundPath
    }
    return false
  })
  if (!foundPath) {
    foundPath = trimmedPathname
  }
  pathCache[trimmedPathname] = foundPath
  return foundPath
}

const wrapHistory = fetchPromise => {
  let succeeded = false
  return fetchPromise
    .then(resource => {
      succeeded = true
      return resource
    })
    .finally(() => {
      fetchHistory.push({ succeeded })
      fetchHistory = fetchHistory.slice(-MAX_HISTORY)
    })
}

const cachedFetch = (resourceName, fetchFn) => {
  if (resourceName in fetchPromiseStore) {
    return fetchPromiseStore[resourceName]
  } else {
    const promise = wrapHistory(fetchFn(resourceName))
    fetchPromiseStore[resourceName] = promise
    return promise.catch(err => {
      delete fetchPromiseStore[resourceName]
      return err
    })
  }
}

const fetchUrl = url =>
  new Promise((resolve, reject) => {
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

const createComponentUrls = componentChunkName =>
  window.___chunkMapping[componentChunkName].map(
    chunk => __PATH_PREFIX__ + chunk
  )

const fetchComponent = chunkName => asyncRequires.components[chunkName]()

const stripSurroundingSlashes = s => {
  s = s[0] === `/` ? s.slice(1) : s
  s = s.endsWith(`/`) ? s.slice(0, -1) : s
  return s
}

const makePageDataUrl = path => {
  const fixedPath = path === `/` ? `index` : stripSurroundingSlashes(path)
  return `${__PATH_PREFIX__}/page-data/${fixedPath}/page-data.json`
}

const fetchPageData = path => {
  const url = makePageDataUrl(path)
  return cachedFetch(url, fetchUrl).then((pageData, err) => {
    fetchedPageData[path] = true
    if (pageData) {
      pageDatas[path] = pageData
      return pageData
    } else {
      failedPaths[path] = err
      return null
    }
  })
}

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

const onPrefetchPathname = pathname => {
  if (!prefetchTriggered[pathname]) {
    apiRunner(`onPrefetchPathname`, { pathname })
    prefetchTriggered[pathname] = true
  }
}

const onPostPrefetch = url => {
  if (!prefetchCompleted[url]) {
    apiRunner(`onPostPrefetch`, { url })
    prefetchCompleted[url] = true
  }
}

/**
 * Check if we should fallback to resources for 404 page if resources for a page are not found
 *
 * We can't do that when we don't have full pages manifest - we don't know if page exist or not if we don't have it.
 * We also can't do that on initial render / mount in case we just can't load resources needed for first page.
 * Not falling back to 404 resources will cause "EnsureResources" component to handle scenarios like this with
 * potential reload
 * @param {string} path Path to a page
 */
const shouldFallbackTo404Resources = path => path !== `/404.html`

// Note we're not actively using the path data atm. There
// could be future optimizations however around trying to ensure
// we load all resources for likely-to-be-visited paths.
// let pathArray = []
// let pathCount = {}

let pathScriptsCache = {}
let prefetchTriggered = {}
let prefetchCompleted = {}
let disableCorePrefetching = false

const queue = {
  addPageData: pageData => {
    pageDatas[pageData.path] = pageData
  },
  addDevRequires: devRequires => {
    syncRequires = devRequires
  },
  addProdRequires: prodRequires => {
    asyncRequires = prodRequires
  },
  // Hovering on a link is a very strong indication the user is going to
  // click on it soon so let's start prefetching resources for this
  // pathname.
  hovering: path => {
    console.log(`hovering`)
    queue.getResourcesForPathname(path)
  },
  enqueue: rawPath => {
    console.log(`enqueueing`)
    if (!apiRunner)
      console.error(`Run setApiRunnerForLoader() before enqueing paths`)

    // Skip prefetching if we know user is on slow or constrained connection
    if (`connection` in navigator) {
      if ((navigator.connection.effectiveType || ``).includes(`2g`)) {
        return false
      }
      if (navigator.connection.saveData) {
        return false
      }
    }

    // Tell plugins with custom prefetching logic that they should start
    // prefetching this path.
    onPrefetchPathname(rawPath)

    // If a plugin has disabled core prefetching, stop now.
    if (disableCorePrefetching.some(a => a)) {
      return false
    }

    // Check if the page exists.
    let realPath = findPath(rawPath)

    if (pageDatas[realPath]) {
      return true
    }

    // TODO
    // if (
    //   process.env.NODE_ENV !== `production` &&
    //   process.env.NODE_ENV !== `test`
    // ) {
    //   devGetPageData(page.path)
    // }

    // Prefetch resources.
    if (process.env.NODE_ENV === `production`) {
      const pageDataUrl = makePageDataUrl(realPath)
      prefetchHelper(pageDataUrl)
        .then(() => {
          console.log(`prefetch page-data finished`)
          // This was just prefetched, so will return a response from
          // the cache instead of making another request to the server
          return fetchUrl(pageDataUrl)
        })
        .then(pageData => {
          // Tell plugins the path has been successfully prefetched
          const chunkName = pageData.componentChunkName
          const componentUrls = createComponentUrls(chunkName)
          return Promise.all(componentUrls.map(prefetchHelper)).then(() => {
            const resourceUrls = [pageDataUrl].concat(componentUrls)
            onPostPrefetch({
              path: rawPath,
              resourceUrls,
            })
          })
        })
    }

    return true
  },

  // TODO
  // getPage: pathname => findPage(pathname),

  getResourcesForPathnameSync: rawPath => {
    console.log(`getResourcesForPathnameSync: [${rawPath}]`)
    const realPath = findPath(rawPath)
    console.log(`getResourcesForPathnameSync: realPath: [${realPath}]`)
    if (realPath in pathScriptsCache) {
      return pathScriptsCache[realPath]
    } else if (shouldFallbackTo404Resources(realPath)) {
      return queue.getResourcesForPathnameSync(`/404.html`)
    } else {
      return null
    }
  },

  getResourcesForPathname: rawPath =>
    new Promise((resolve, reject) => {
      console.log(`getResourcesForPathname: [${rawPath}]`)
      // Production code path
      if (failedPaths[rawPath]) {
        handleResourceLoadError(
          rawPath,
          `Previously detected load failure for "${rawPath}"`
        )
        reject()
        return
      }

      const realPath = findPath(rawPath)
      console.log(`real path is [${realPath}]`)

      if (!fetchedPageData[realPath]) {
        console.log(`Requesting page data for [${realPath}] for first time`)
        fetchPageData(realPath).then(() =>
          resolve(queue.getResourcesForPathname(rawPath))
        )
        return
      }

      const pageData = pageDatas[realPath]

      if (!pageData) {
        if (shouldFallbackTo404Resources(realPath)) {
          console.log(`No page found: [${rawPath}]`)

          // Preload the custom 404 page
          resolve(queue.getResourcesForPathname(`/404.html`))
          return
        }

        resolve()
        return
      }

      // Check if it's in the cache already.
      if (pathScriptsCache[realPath]) {
        const pageResources = pathScriptsCache[realPath]
        emitter.emit(`onPostLoadPageResources`, {
          page: pageResources,
          pageResources: pathScriptsCache[realPath],
        })
        resolve(pageResources)
        return
      }

      // Nope, we need to load resource(s)
      emitter.emit(`onPreLoadPageResources`, {
        path: realPath,
      })

      const { componentChunkName } = pageData

      if (process.env.NODE_ENV !== `production`) {
        const page = {
          componentChunkName: pageData.componentChunkName,
          path: pageData.path,
        }
        const pageResources = {
          component: syncRequires.components[page.componentChunkName],
          page,
        }

        // Add to the cache.
        pathScriptsCache[realPath] = pageResources
        devGetPageData(page.path).then(pageData => {
          emitter.emit(`onPostLoadPageResources`, {
            page,
            pageResources,
          })
          // Tell plugins the path has been successfully prefetched
          // TODO onPostPrefetch(makePageDataUrl(realPath))

          resolve(pageResources)
        })
      } else {
        console.log(`getting page component: [${componentChunkName}]`)
        cachedFetch(componentChunkName, fetchComponent)
          .then(preferDefault)
          .then(component => {
            console.log(`got component`)
            if (!component) {
              resolve(null)
              return
            }

            const page = {
              componentChunkName,
              path: pageData.path,
            }

            const jsonData = {
              data: pageData.data,
              pageContext: pageData.pageContext,
            }

            const pageResources = {
              component,
              json: jsonData,
              page,
            }

            // TODO
            // pageResources.page.jsonURL = createJsonURL(
            //   jsonDataPaths[page.jsonName]
            // )
            pathScriptsCache[realPath] = pageResources
            resolve(pageResources)

            emitter.emit(`onPostLoadPageResources`, {
              page,
              pageResources,
            })

            // Tell plugins the path has been successfully prefetched
            const pageDataUrl = makePageDataUrl(realPath)
            const componentUrls = createComponentUrls(componentChunkName)
            const resourceUrls = [pageDataUrl].concat(componentUrls)
            onPostPrefetch({
              path: rawPath,
              resourceUrls,
            })
          })
      }
    }),
}

// TODO This doesn't make sense anymore
export const postInitialRenderWork = () => {
  inInitialRender = false
  if (process.env.NODE_ENV === `production`) {
    // We got all resources needed for first mount,
    // we can fetch resources for all pages.
    fetchPageResourceMap()
  }
}

export const setApiRunnerForLoader = runner => {
  apiRunner = runner
  disableCorePrefetching = apiRunner(`disableCorePrefetching`)
}

export const publicLoader = {
  getResourcesForPathname: queue.getResourcesForPathname,
  getResourcesForPathnameSync: queue.getResourcesForPathnameSync,
}

export default queue
