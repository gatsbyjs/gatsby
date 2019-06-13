import emitter from "./emitter"
import prefetchHelper from "./prefetch"
import { match } from "@reach/router/lib/utils"
import normalizePagePath from "./normalize-page-path"
import stripPrefix from "./strip-prefix"

const preferDefault = m => (m && m.default) || m

const pageNotFoundPaths = new Set()

let apiRunner
let syncRequires = {}
let asyncRequires = {}
let matchPaths = {}

const fetchedPageData = {}
const pageDatas = {}
const fetchPromiseStore = {}
const pageHtmlExistsResults = {}

let devGetPageData
if (process.env.NODE_ENV !== `production`) {
  devGetPageData = require(`./socketIo`).getPageData
}

// Cache for `cleanAndFindPath()`. In case `match-paths.json` is large
const cleanAndFindPathCache = {}

const findMatchPath = (matchPaths, trimmedPathname) => {
  for (const { matchPath, path } of matchPaths) {
    if (match(matchPath, trimmedPathname)) {
      return path
    }
  }
  return null
}

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
  let trimmedPathname = stripPrefix(pathname, __BASE_PATH__)
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

  let foundPath = findMatchPath(matchPaths, trimmedPathname)
  if (!foundPath) {
    if (trimmedPathname === `/index.html`) {
      foundPath = `/`
    } else {
      foundPath = trimmedPathname
    }
  }
  foundPath = normalizePagePath(foundPath)
  cleanAndFindPathCache[trimmedPathname] = foundPath
  return foundPath
}

const cachedFetch = (resourceName, fetchFn) => {
  if (resourceName in fetchPromiseStore) {
    return fetchPromiseStore[resourceName]
  }
  const promise = fetchFn(resourceName)
  fetchPromiseStore[resourceName] = promise
  return promise.catch(err => {
    delete fetchPromiseStore[resourceName]
    return err
  })
}

const doFetch = (url, method = `GET`) =>
  new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()
    req.open(method, url, true)
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
    // Since we don't know if a URL is a page or not until we make a
    // request to the server, the response could be anything. E.g an
    // index.html. So we have to double check that response is
    // actually a proper JSON file. If it isn't, then it's not a page
    // and we can infer that the requested page doesn't exist
    if (!contentType || !contentType.startsWith(`application/json`)) {
      pageNotFoundPaths.add(path)
      // null signifies "page doesn't exist"
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
    // TODO At the moment, if a 500 error occurs, we act as if the
    // page doesn't exist at all. We should perform retry logic
    // instead
    pageNotFoundPaths.add(path)
    return null
  }
}

const fetchPageData = path => {
  const url = createPageDataUrl(path)
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

const createPageDataUrl = path => {
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

const onPostPrefetchPathname = pathname => {
  if (!prefetchCompleted[pathname]) {
    apiRunner(`onPostPrefetchPathname`, { pathname })
    prefetchCompleted[pathname] = true
  }
}

const loadComponent = componentChunkName => {
  if (process.env.NODE_ENV !== `production`) {
    return Promise.resolve(syncRequires.components[componentChunkName])
  } else {
    return cachedFetch(componentChunkName, fetchComponent).then(preferDefault)
  }
}

const queue = {
  // gatsby-link can be used as a standalone library. Since it depends
  // on window.___loader, we have to assume the code calls loader.js
  // but without a gatsby build having occured. In this case,
  // `async-requires.js, match-paths.json` etc won't exist. Therefore,
  // we import those assets in production-app.js, and then dynamically
  // set them onto the loader
  addDevRequires: devRequires => {
    syncRequires = devRequires
  },
  addProdRequires: prodRequires => {
    asyncRequires = prodRequires
  },
  addMatchPaths: _matchPaths => {
    matchPaths = _matchPaths
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
      const pageDataUrl = createPageDataUrl(realPath)
      prefetchHelper(pageDataUrl)
        .then(() =>
          // This was just prefetched, so will return a response from
          // the cache instead of making another request to the server
          fetchPageData(realPath)
        )
        .then(pageData => {
          if (pageData === null) {
            return Promise.resolve()
          }
          // Tell plugins the path has been successfully prefetched
          const chunkName = pageData.componentChunkName
          const componentUrls = createComponentUrls(chunkName)
          return Promise.all(componentUrls.map(prefetchHelper)).then(() => {
            onPostPrefetchPathname(rawPath)
          })
        })
    }

    return true
  },

  isPageNotFound: pathname => pageNotFoundPaths.has(cleanAndFindPath(pathname)),

  loadPageData: rawPath => {
    const realPath = cleanAndFindPath(rawPath)
    if (queue.isPageNotFound(realPath)) {
      return Promise.resolve(null)
    }
    if (!fetchedPageData[realPath]) {
      return fetchPageData(realPath).then(pageData => {
        if (process.env.NODE_ENV !== `production`) {
          devGetPageData(realPath)
        }
        return queue.loadPageData(rawPath)
      })
    }
    return Promise.resolve(pageDatas[realPath])
  },

  loadPage: rawPath =>
    queue
      .loadPageData(rawPath)
      .then(pageData => {
        // If no page was found, then preload the 404.html
        if (pageData === null && rawPath !== `/404.html`) {
          return Promise.all([
            queue.doesPageHtmlExist(rawPath),
            queue.loadPage(`/404.html`),
          ]).then(() => null)
        }
        // Otherwise go ahead and load the page's component
        return loadComponent(pageData.componentChunkName).then(component => {
          const page = {
            componentChunkName: pageData.componentChunkName,
            path: pageData.path,
            webpackCompilationHash: pageData.webpackCompilationHash,
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
            onPostPrefetchPathname(rawPath)
          }

          return pageResources
        })
      })
      .catch(() => null),

  loadPageOr404: rawPath =>
    queue
      .loadPage(rawPath)
      .then(result =>
        result === null && rawPath !== `/404.html`
          ? queue.loadPageSync(`/404.html`)
          : null
      ),

  loadPageSync: rawPath => pathScriptsCache[cleanAndFindPath(rawPath)],

  getResourceURLsForPathname: rawPath => {
    const path = cleanAndFindPath(rawPath)
    const pageData = pageDatas[path]
    if (pageData) {
      return [
        ...createComponentUrls(pageData.componentChunkName),
        createPageDataUrl(path),
      ]
    } else {
      return null
    }
  },

  doesPageHtmlExist: rawPath => {
    const path = cleanAndFindPath(rawPath)
    if (pageHtmlExistsResults.hasOwnProperty(path)) {
      return pageHtmlExistsResults[path]
    }

    return doFetch(path, `HEAD`).then(req => {
      pageHtmlExistsResults[path] = req.status === 200
    })
  },

  doesPageHtmlExistSync: rawPath =>
    pageHtmlExistsResults[cleanAndFindPath(rawPath)],
}

export const postInitialRenderWork = () => {
  console.warn(`Warning: postInitialRenderWork is deprecated. It is now a noop`)
}

export const setApiRunnerForLoader = runner => {
  apiRunner = runner
  disableCorePrefetching = apiRunner(`disableCorePrefetching`)
}

export const publicLoader = {
  // Deprecated methods. As far as we're aware, these are only used by
  // core gatsby and the offline plugin, however there's a very small
  // chance they're called by others.
  getResourcesForPathname: rawPath => {
    console.warn(
      `Warning: getResourcesForPathname is deprecated. Use loadPage instead`
    )
    return queue.loadPage(rawPath)
  },
  getResourcesForPathnameSync: rawPath => {
    console.warn(
      `Warning: getResourcesForPathnameSync is deprecated. Use loadPageSync instead`
    )
    return queue.loadPageSync(rawPath)
  },

  // Real methods
  getResourceURLsForPathname: queue.getResourceURLsForPathname,
  loadPage: queue.loadPage,
  loadPageSync: queue.loadPageSync,
}

export default queue
