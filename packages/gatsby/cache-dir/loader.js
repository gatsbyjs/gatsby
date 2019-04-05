import emitter from "./emitter"
import prefetchHelper from "./prefetch"
import { match } from "@reach/router/lib/utils"
import stripPrefix from "./strip-prefix"
// Generated during bootstrap
import matchPaths from "./match-paths.json"

const preferDefault = m => (m && m.default) || m

const pageNotFoundPaths = new Set()

let apiRunner
let syncRequires = {}
let asyncRequires = {}

const fetchedPageData = {}
const pageDatas = {}
const fetchPromiseStore = {}

let devGetPageData
if (process.env.NODE_ENV !== `production`) {
  devGetPageData = require(`./socketIo`).getPageData
}

// Cache for `cleanAndFindPath()`. In case `match-paths.json` is large
const cleanAndFindPathCache = {}

// Given a raw URL path, returns the cleaned version of it (trim off
// `#` and query params), or if it matches an entry in
// `match-paths.json`, its matched path is returned
//
// E.g `/foo?bar=far` => `/foo`
//
// Or if `match-paths.json` contains `{ "/foo*": "/page1", ...}`, then
// `/foo?bar=far` => `/page1`
const cleanAndFindPath = rawPathname => {
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
  if (cleanAndFindPathCache[trimmedPathname]) {
    return cleanAndFindPathCache[trimmedPathname]
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
  cleanAndFindPathCache[trimmedPathname] = foundPath
  return foundPath
}

const cachedFetch = (resourceName, fetchFn) => {
  if (resourceName in fetchPromiseStore) {
    return fetchPromiseStore[resourceName]
  } else {
    const promise = fetchFn(resourceName)
    fetchPromiseStore[resourceName] = promise
    return promise.catch(err => {
      delete fetchPromiseStore[resourceName]
      return err
    })
  }
}

const doFetch = url =>
  new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()
    req.open(`GET`, url, true)
    req.withCredentials = true
    req.onreadystatechange = () => {
      if (req.readyState == 4) {
        resolve(req)
      }
    }
    req.send(null)
  })

const handlePageDataResponse = (path, req) => {
  fetchedPageData[path] = true
  if (req.status === 200) {
    const contentType = req.getResponseHeader(`content-type`)
    if (!contentType || !contentType.startsWith(`application/json`)) {
      pageNotFoundPaths.add(path)
      return null
    } else {
      const pageData = JSON.parse(req.responseText)
      pageDatas[path] = pageData
      return pageData
    }
  } else if (req.status === 404) {
    pageNotFoundPaths.add(path)
    return null
  } else {
    throw new Error(`error fetching page`)
  }
}

const fetchPageData = path => {
  const url = makePageDataUrl(path)
  return cachedFetch(url, doFetch).then(req =>
    handlePageDataResponse(path, req)
  )
}

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

const onPrefetchPathname = pathname => {
  if (!prefetchTriggered[pathname]) {
    apiRunner(`onPrefetchPathname`, { pathname })
    prefetchTriggered[pathname] = true
  }
}

// Note we're not actively using the path data atm. There
// could be future optimizations however around trying to ensure
// we load all resources for likely-to-be-visited paths.
// let pathArray = []
// let pathCount = {}

let pathScriptsCache = {}
let prefetchTriggered = {}
let prefetchCompleted = {}
let disableCorePrefetching = false

const onPostPrefetch = url => {
  if (!prefetchCompleted[url]) {
    apiRunner(`onPostPrefetch`, { url })
    prefetchCompleted[url] = true
  }
}

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
  hovering: path => queue.loadPage(path),
  enqueue: rawPath => {
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
    let realPath = cleanAndFindPath(rawPath)

    if (pageDatas[realPath]) {
      return true
    }

    if (
      process.env.NODE_ENV !== `production` &&
      process.env.NODE_ENV !== `test`
    ) {
      // Ensure latest version of page data is in the JSON store
      devGetPageData(realPath)
    }

    if (process.env.NODE_ENV === `production`) {
      const pageDataUrl = makePageDataUrl(realPath)
      prefetchHelper(pageDataUrl)
        .then(() =>
          // This was just prefetched, so will return a response from
          // the cache instead of making another request to the server
          fetchPageData(realPath)
        )
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

  isPageNotFound: pathname => pageNotFoundPaths.has(pathname),

  loadPageData: rawPath =>
    new Promise((resolve, reject) => {
      const realPath = cleanAndFindPath(rawPath)
      if (!fetchedPageData[realPath]) {
        fetchPageData(realPath).then(pageData => {
          if (process.env.NODE_ENV !== `production`) {
            devGetPageData(realPath)
          }
          resolve(queue.loadPageData(rawPath))
        })
      } else {
        if (pageDatas[realPath]) {
          resolve(pageDatas[realPath])
        } else {
          reject(new Error(`page not found`))
        }
      }
    }),

  loadPage: rawPath =>
    queue
      .loadPageData(rawPath)
      .then(pageData => {
        if (process.env.NODE_ENV !== `production`) {
          const component = syncRequires.components[pageData.componentChunkName]
          return [pageData, component]
        } else {
          return cachedFetch(pageData.componentChunkName, fetchComponent)
            .then(preferDefault)
            .then(component => [pageData, component])
        }
      })
      .then(([pageData, component]) => {
        const page = {
          componentChunkName: pageData.componentChunkName,
          path: pageData.path,
        }

        const jsonData = pageData.result

        const pageResources = {
          component,
          json: jsonData,
          page,
        }

        pathScriptsCache[cleanAndFindPath(rawPath)] = pageResources
        emitter.emit(`onPostLoadPageResources`, {
          page: pageResources,
          pageResources,
        })
        if (process.env.NODE_ENV === `production`) {
          const pageDataUrl = makePageDataUrl(cleanAndFindPath(rawPath))
          const componentUrls = createComponentUrls(pageData.componentChunkName)
          const resourceUrls = [pageDataUrl].concat(componentUrls)
          onPostPrefetch({
            path: rawPath,
            resourceUrls,
          })
        }

        return pageResources
      })
      .catch(err => null),

  getPage: rawPath => pathScriptsCache[cleanAndFindPath(rawPath)],

  getPageOr404: rawPath => {
    const page = queue.getPage(rawPath)
    if (page) {
      return page
    } else if (rawPath !== `/404.html`) {
      return queue.getPage(`/404.html`)
    } else {
      return null
    }
  },

  getResourceURLsForPathname: path => {
    const pageData = queue.getPage(path)
    if (pageData) {
      // Original implementation also concatenated the jsonDataPath
      // for the page
      return createComponentUrls(pageData.componentChunkName)
    } else {
      return null
    }
  },
}

// Deprecated April 2019. Used to fetch the pages-manifest. Now it's a
// noop
export const postInitialRenderWork = () => {}

export const setApiRunnerForLoader = runner => {
  apiRunner = runner
  disableCorePrefetching = apiRunner(`disableCorePrefetching`)
}

export const publicLoader = {
  // Deprecated April 2019. Use `loadPage` instead
  getResourcesForPathname: queue.loadPage,
  // Deprecated April 2019. Use `getPage` instead
  getResourcesForPathnameSync: queue.getPage,
  // Deprecated April 2019. Query results used to be in a separate
  // file, but are now included in the page-data.json, which is
  // already loaded into the browser by the time this function is
  // called. Use the resource URLs passed in `onPostPrefetch` instead.
  getResourceURLsForPathname: queue.getResourceURLsForPathname,

  loadPage: queue.loadPage,
  getPage: queue.getPage,
  getPageOr404: queue.getPageOr404,
}

export default queue
