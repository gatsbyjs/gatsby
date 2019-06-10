import prefetchHelper from "./prefetch"
import emitter from "./emitter"
import normalizePagePath from "./normalize-page-path"
import stripPrefix from "./strip-prefix"
import { match } from "@reach/router/lib/utils"

const stripSurroundingSlashes = s => {
  s = s[0] === `/` ? s.slice(1) : s
  s = s.endsWith(`/`) ? s.slice(0, -1) : s
  return s
}

const createPageDataUrl = path => {
  const fixedPath = path === `/` ? `index` : stripSurroundingSlashes(path)
  return `${__PATH_PREFIX__}/page-data/${fixedPath}/page-data.json`
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

const loadPageDataJson = loadObj => {
  const { pagePath, retries = 0 } = loadObj
  const url = createPageDataUrl(pagePath)
  return doFetch(url).then(req => {
    const { status, responseText } = req

    const contentType = req.getResponseHeader(`content-type`)
    const isJson = contentType && contentType.startsWith(`application/json`)

    // Handle 200 JSON (Success)
    if (status === 200 && isJson) {
      return Object.assign(loadObj, {
        status: `success`,
        payload: JSON.parse(responseText),
      })
    }

    // Handle 404
    if (status === 404 || (status === 200 && !isJson)) {
      // If the request was for a 404 page and it doesn't exist, we're done
      if (pagePath === `/404.html`) {
        return Object.assign(loadObj, {
          status: `failure`,
        })
      }

      // Need some code here to cache the 404 request. In case
      // multiple loadPageDataJsons result in 404s
      return loadPageDataJson(
        Object.assign(loadObj, { pagePath: `/404.html`, notFound: true })
      )
    }

    // handle 500 response (Unrecoverable)
    if (status === 500) {
      return Object.assign(loadObj, {
        status: `error`,
      })
    }

    // Handle everything else, including status === 0, and 503s. Should retry
    if (retries < 3) {
      return loadPageDataJson(Object.assign(loadObj, { retries: retries + 1 }))
    }

    // Retried 3 times already, result is a failure.
    return Object.assign(loadObj, {
      status: `error`,
    })
  })
}

const doesConnectionSupportPrefetch = () => {
  if (`connection` in navigator) {
    if ((navigator.connection.effectiveType || ``).includes(`2g`)) {
      return false
    }
    if (navigator.connection.saveData) {
      return false
    }
  }
  return true
}

const toPageResources = (pageData, component) => {
  const page = {
    componentChunkName: pageData.componentChunkName,
    path: pageData.path,
    webpackCompilationHash: pageData.webpackCompilationHash,
  }

  return {
    component,
    json: pageData.result,
    page,
  }
}

const findMatchPath = (matchPaths, trimmedPathname) => {
  for (const { matchPath, path } of matchPaths) {
    if (match(matchPath, trimmedPathname)) {
      return path
    }
  }
  return null
}

const trimPathname = rawPathname => {
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
  return trimmedPathname
}

export class BaseLoader {
  constructor(loadComponent, matchPaths) {
    // Map of pagePath -> Page. Where Page is an object with: {
    //   status: `success` || `error`,
    //   payload: PageResources, // undefined if `error`
    // }
    // PageResources is {
    //   component,
    //   json: pageData.result,
    //   page: {
    //     componentChunkName,
    //     path,
    //     webpackCompilationHash,
    //   }
    // }
    this.pageDb = new Map()
    this.inFlightDb = new Map()
    this.loadComponent = loadComponent
    this.prefetchTriggered = new Set()
    this.matchPaths = matchPaths
    this.foundPaths = new Map()
  }

  setApiRunner(apiRunner) {
    this.apiRunner = apiRunner
    this.prefetchDisabled = apiRunner(`disableCorePrefetching`).some(a => a)
  }

  // Given a raw URL path, returns the cleaned version of it (trim off
  // `#` and query params), or if it matches an entry in
  // `match-paths.json`, its matched path is returned
  //
  // E.g `/foo?bar=far` => `/foo`
  //
  // Or if `match-paths.json` contains `{ "/foo*": "/page1", ...}`, then
  // `/foo?bar=far` => `/page1`
  cleanAndFindPath(rawPathname) {
    let trimmedPathname = trimPathname(rawPathname)

    if (this.foundPaths.has(trimmedPathname)) {
      return this.foundPaths.get(trimmedPathname)
    }

    let foundPath = findMatchPath(this.matchPaths, trimmedPathname)
    if (!foundPath) {
      if (trimmedPathname === `/index.html`) {
        foundPath = `/`
      } else {
        foundPath = trimmedPathname
      }
    }
    foundPath = normalizePagePath(foundPath)
    this.foundPaths.set(trimmedPathname, foundPath)
    return foundPath
  }

  loadPageDataJson(pagePath) {
    return loadPageDataJson(pagePath)
  }

  // TODO check all uses of this and whether they use undefined for page resources not exist
  loadPage(rawPath) {
    const pagePath = this.cleanAndFindPath(rawPath)
    if (this.pageDb.has(pagePath)) {
      const page = this.pageDb.get(pagePath)
      return Promise.resolve(page.payload)
    }
    if (this.inFlightDb.has(pagePath)) {
      return this.inFlightDb.get(pagePath)
    }
    const inFlight = this.loadPageDataJson({ pagePath })
      .then(result => {
        if (result.status === `error`) {
          return {
            status: `error`,
          }
        }
        const pageData = result.payload
        const { componentChunkName } = pageData
        return this.loadComponent(componentChunkName).then(component => {
          const finalResult = { createdAt: new Date() }
          let pageResources
          if (!component) {
            finalResult.status = `error`
          } else {
            finalResult.status = `success`
            if (result.notFound === true) {
              finalResult.notFound = true
            }
            pageResources = toPageResources(pageData, component)
            finalResult.payload = pageResources
            emitter.emit(`onPostLoadPageResources`, {
              page: pageResources,
              pageResources,
            })
          }
          this.pageDb.set(pagePath, finalResult)
          // undefined if final result is an error
          return pageResources
        })
      })
      .finally(() => {
        this.inFlightDb.delete(pagePath)
      })

    this.inFlightDb.set(pagePath, inFlight)
    return inFlight
  }

  // returns undefined if loading page ran into errors
  loadPageSync(rawPath) {
    const pagePath = this.cleanAndFindPath(rawPath)
    return this.pageDb.get(pagePath).payload
  }

  shouldPrefetch(pagePath) {
    // If a plugin has disabled core prefetching, stop now.
    if (this.prefetchDisabled) {
      return false
    }

    // Skip prefetching if we know user is on slow or constrained connection
    if (!doesConnectionSupportPrefetch()) {
      return false
    }

    // Check if the page exists.
    if (this.pageDb.has(pagePath)) {
      return false
    }

    return true
  }

  prefetch(pagePath) {
    throw new Error(`prefetch not implemented`)
  }

  hovering(rawPath) {
    this.loadPage(rawPath)
  }

  getResourceURLsForPathname(rawPath) {
    const pagePath = this.cleanAndFindPath(rawPath)
    const page = this.loadPageSync(pagePath)
    if (page) {
      return [
        ...createComponentUrls(page.page.componentChunkName),
        createPageDataUrl(pagePath),
      ]
    } else {
      return null
    }
  }

  isPageNotFound(rawPath) {
    const pagePath = this.cleanAndFindPath(rawPath)
    const page = this.pageDb.get(pagePath)
    return page && page.notFound === true
  }
}

const createComponentUrls = componentChunkName =>
  window.___chunkMapping[componentChunkName].map(
    chunk => __PATH_PREFIX__ + chunk
  )

export class ProdLoader extends BaseLoader {
  constructor(asyncRequires, matchPaths) {
    const loadComponent = chunkName => asyncRequires.components[chunkName]()
    super(loadComponent, matchPaths)
    this.prefetchCompleted = new Set()
  }

  onPostPrefetchPathname(pathname) {
    if (!this.prefetchCompleted.has(pathname)) {
      this.apiRunner(`onPostPrefetchPathname`, { pathname })
      this.prefetchCompleted.add(pathname)
    }
  }

  loadPage(pagePath) {
    return super.loadPage(pagePath).then(result => {
      // Was rawPath
      this.onPostPrefetchPathname(pagePath)
      return result
    })
  }

  prefetch(pagePath) {
    if (!super.shouldPrefetch(pagePath)) {
      return
    }
    // Tell plugins with custom prefetching logic that they should start
    // prefetching this path.
    if (!this.prefetchTriggered.has(pagePath)) {
      this.apiRunner(`onPrefetchPathname`, { pathname: pagePath })
      this.prefetchTriggered.add(pagePath)
    }

    const pageDataUrl = createPageDataUrl(pagePath)
    prefetchHelper(pageDataUrl)
      .then(() =>
        // This was just prefetched, so will return a response from
        // the cache instead of making another request to the server
        loadPageDataJson(pagePath)
      )
      .then(result => {
        if (result.status !== `success`) {
          return Promise.resolve()
        }
        const pageData = result.payload
        // Tell plugins the path has been successfully prefetched
        const chunkName = pageData.componentChunkName
        const componentUrls = createComponentUrls(chunkName)
        return Promise.all(componentUrls.map(prefetchHelper)).then(() => {
          this.onPostPrefetchPathname(pagePath)
        })
      })
  }
}

let instance

export const setLoader = _loader => {
  instance = _loader
}

export const publicLoader = {
  // Deprecated methods. As far as we're aware, these are only used by
  // core gatsby and the offline plugin, however there's a very small
  // chance they're called by others.
  getResourcesForPathname: rawPath => {
    console.warn(
      `Warning: getResourcesForPathname is deprecated. Use loadPage instead`
    )
    return instance.i.loadPage(rawPath)
  },
  getResourcesForPathnameSync: rawPath => {
    console.warn(
      `Warning: getResourcesForPathnameSync is deprecated. Use loadPageSync instead`
    )
    return instance.i.loadPageSync(rawPath)
  },
  enqueue: rawPath => instance.prefetch(rawPath),

  // Real methods
  getResourceURLsForPathname: rawPath =>
    instance.getResourceURLsForPathname(rawPath),
  loadPage: rawPath => instance.loadPage(rawPath),
  loadPageSync: rawPath => instance.loadPageSync(rawPath),
  prefetch: rawPath => instance.prefetch(rawPath),
  isPageNotFound: rawPath => instance.isPageNotFound(rawPath),
  hovering: rawPath => instance.hovering(rawPath),
}

const loader = publicLoader

export default loader
