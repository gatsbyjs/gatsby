import prefetchHelper from "./prefetch"
import emitter from "./emitter"
import { setMatchPaths, findPath, findMatchPath } from "./find-path"

/**
 * Available resource loading statuses
 */
export const PageResourceStatus = {
  /**
   * At least one of critical resources failed to load
   */
  Error: `error`,
  /**
   * Resources loaded successfully
   */
  Success: `success`,
}

const preferDefault = m => (m && m.default) || m

const stripSurroundingSlashes = s => {
  s = s[0] === `/` ? s.slice(1) : s
  s = s.endsWith(`/`) ? s.slice(0, -1) : s
  return s
}

const createPageDataUrl = path => {
  const fixedPath = path === `/` ? `index` : stripSurroundingSlashes(path)
  return `${__PATH_PREFIX__}/page-data/${fixedPath}/page-data.json`
}

function doFetch(url, method = `GET`) {
  return new Promise((resolve, reject) => {
    const req = new XMLHttpRequest()
    req.open(method, url, true)
    req.onreadystatechange = () => {
      if (req.readyState == 4) {
        resolve(req)
      }
    }
    req.send(null)
  })
}

const doesConnectionSupportPrefetch = () => {
  if (
    `connection` in navigator &&
    typeof navigator.connection !== `undefined`
  ) {
    if ((navigator.connection.effectiveType || ``).includes(`2g`)) {
      return false
    }
    if (navigator.connection.saveData) {
      return false
    }
  }
  return true
}

const toPageResources = (pageData, component = null) => {
  const page = {
    componentChunkName: pageData.componentChunkName,
    path: pageData.path,
    webpackCompilationHash: pageData.webpackCompilationHash,
    matchPath: pageData.matchPath,
    staticQueryHashes: pageData.staticQueryHashes,
  }

  return {
    component,
    json: pageData.result,
    page,
  }
}

export class BaseLoader {
  constructor(loadComponent, matchPaths) {
    // Map of pagePath -> Page. Where Page is an object with: {
    //   status: PageResourceStatus.Success || PageResourceStatus.Error,
    //   payload: PageResources, // undefined if PageResourceStatus.Error
    // }
    // PageResources is {
    //   component,
    //   json: pageData.result,
    //   page: {
    //     componentChunkName,
    //     path,
    //     webpackCompilationHash,
    //     staticQueryHashes
    //   },
    //   staticQueryResults
    // }
    this.pageDb = new Map()
    this.inFlightDb = new Map()
    this.staticQueryDb = {}
    this.pageDataDb = new Map()
    this.prefetchTriggered = new Set()
    this.prefetchCompleted = new Set()
    this.loadComponent = loadComponent
    setMatchPaths(matchPaths)
  }

  inFlightNetworkRequests = new Map()

  memoizedGet(url) {
    let inFlightPromise = this.inFlightNetworkRequests.get(url)

    if (!inFlightPromise) {
      inFlightPromise = doFetch(url, `GET`)
      this.inFlightNetworkRequests.set(url, inFlightPromise)
    }

    // Prefer duplication with then + catch over .finally to prevent problems in ie11 + firefox
    return inFlightPromise
      .then(response => {
        this.inFlightNetworkRequests.delete(url)
        return response
      })
      .catch(err => {
        this.inFlightNetworkRequests.delete(url)
        throw err
      })
  }

  setApiRunner(apiRunner) {
    this.apiRunner = apiRunner
    this.prefetchDisabled = apiRunner(`disableCorePrefetching`).some(a => a)
  }

  fetchPageDataJson(loadObj) {
    const { pagePath, retries = 0 } = loadObj
    const url = createPageDataUrl(pagePath)
    return this.memoizedGet(url).then(req => {
      const { status, responseText } = req

      // Handle 200
      if (status === 200) {
        try {
          const jsonPayload = JSON.parse(responseText)
          if (jsonPayload.path === undefined) {
            throw new Error(`not a valid pageData response`)
          }

          // In development, check if the page is in the bundle yet.
          if (
            process.env.NODE_ENV === `development` &&
            process.env.GATSBY_EXPERIMENTAL_LAZY_DEVJS
          ) {
            const ensureComponentInBundle = require(`./ensure-page-component-in-bundle`)
              .default
            if (process.env.NODE_ENV !== `test`) {
              delete require.cache[
                require.resolve(`$virtual/lazy-client-sync-requires`)
              ]
            }

            const lazyRequires = require(`$virtual/lazy-client-sync-requires`)
            if (
              lazyRequires.notVisitedPageComponents[
                jsonPayload.componentChunkName
              ]
            ) {
              // Tell the server the user wants to visit this page
              // to trigger it including the page component's code in the
              // commons bundles.
              ensureComponentInBundle(jsonPayload.componentChunkName)

              return new Promise(resolve =>
                setTimeout(() => resolve(this.fetchPageDataJson(loadObj)), 100)
              )
            }
          }

          return Object.assign(loadObj, {
            status: PageResourceStatus.Success,
            payload: jsonPayload,
          })
        } catch (err) {
          // continue regardless of error
        }
      }

      // Handle 404
      if (status === 404 || status === 200) {
        // If the request was for a 404 page and it doesn't exist, we're done
        if (pagePath === `/404.html`) {
          return Object.assign(loadObj, {
            status: PageResourceStatus.Error,
          })
        }

        // Need some code here to cache the 404 request. In case
        // multiple loadPageDataJsons result in 404s
        return this.fetchPageDataJson(
          Object.assign(loadObj, { pagePath: `/404.html`, notFound: true })
        )
      }

      // handle 500 response (Unrecoverable)
      if (status === 500) {
        return Object.assign(loadObj, {
          status: PageResourceStatus.Error,
        })
      }

      // Handle everything else, including status === 0, and 503s. Should retry
      if (retries < 3) {
        return this.fetchPageDataJson(
          Object.assign(loadObj, { retries: retries + 1 })
        )
      }

      // Retried 3 times already, result is an error.
      return Object.assign(loadObj, {
        status: PageResourceStatus.Error,
      })
    })
  }

  loadPageDataJson(rawPath) {
    const pagePath = findPath(rawPath)
    if (this.pageDataDb.has(pagePath)) {
      const pageData = this.pageDataDb.get(pagePath)
      if (!process.env.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND || !pageData.stale) {
        return Promise.resolve(pageData)
      }
    }

    return this.fetchPageDataJson({ pagePath }).then(pageData => {
      this.pageDataDb.set(pagePath, pageData)

      return pageData
    })
  }

  findMatchPath(rawPath) {
    return findMatchPath(rawPath)
  }

  // TODO check all uses of this and whether they use undefined for page resources not exist
  loadPage(rawPath) {
    const pagePath = findPath(rawPath)
    if (this.pageDb.has(pagePath)) {
      const page = this.pageDb.get(pagePath)
      if (
        !process.env.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND ||
        !page.payload.stale
      ) {
        return Promise.resolve(page.payload)
      }
    }

    if (this.inFlightDb.has(pagePath)) {
      return this.inFlightDb.get(pagePath)
    }

    const inFlightPromise = Promise.all([
      this.loadAppData(),
      this.loadPageDataJson(pagePath),
    ]).then(allData => {
      const result = allData[1]
      if (result.status === PageResourceStatus.Error) {
        return {
          status: PageResourceStatus.Error,
        }
      }

      let pageData = result.payload
      const { componentChunkName, staticQueryHashes = [] } = pageData

      const finalResult = {}

      const componentChunkPromise = this.loadComponent(componentChunkName).then(
        component => {
          finalResult.createdAt = new Date()
          let pageResources
          if (!component) {
            finalResult.status = PageResourceStatus.Error
          } else {
            finalResult.status = PageResourceStatus.Success
            if (result.notFound === true) {
              finalResult.notFound = true
            }
            pageData = Object.assign(pageData, {
              webpackCompilationHash: allData[0]
                ? allData[0].webpackCompilationHash
                : ``,
            })
            pageResources = toPageResources(pageData, component)
          }
          // undefined if final result is an error
          return pageResources
        }
      )

      const staticQueryBatchPromise = Promise.all(
        staticQueryHashes.map(staticQueryHash => {
          // Check for cache in case this static query result has already been loaded
          if (this.staticQueryDb[staticQueryHash]) {
            const jsonPayload = this.staticQueryDb[staticQueryHash]
            return { staticQueryHash, jsonPayload }
          }

          return this.memoizedGet(
            `${__PATH_PREFIX__}/page-data/sq/d/${staticQueryHash}.json`
          ).then(req => {
            const jsonPayload = JSON.parse(req.responseText)
            return { staticQueryHash, jsonPayload }
          })
        })
      ).then(staticQueryResults => {
        const staticQueryResultsMap = {}

        staticQueryResults.forEach(({ staticQueryHash, jsonPayload }) => {
          staticQueryResultsMap[staticQueryHash] = jsonPayload
          this.staticQueryDb[staticQueryHash] = jsonPayload
        })

        return staticQueryResultsMap
      })

      return Promise.all([componentChunkPromise, staticQueryBatchPromise]).then(
        ([pageResources, staticQueryResults]) => {
          let payload
          if (pageResources) {
            payload = { ...pageResources, staticQueryResults }
            finalResult.payload = payload
            emitter.emit(`onPostLoadPageResources`, {
              page: payload,
              pageResources: payload,
            })
          }

          this.pageDb.set(pagePath, finalResult)

          return payload
        }
      )
    })

    inFlightPromise
      .then(response => {
        this.inFlightDb.delete(pagePath)
      })
      .catch(error => {
        this.inFlightDb.delete(pagePath)
        throw error
      })

    this.inFlightDb.set(pagePath, inFlightPromise)

    return inFlightPromise
  }

  // returns undefined if loading page ran into errors
  loadPageSync(rawPath) {
    const pagePath = findPath(rawPath)
    if (this.pageDb.has(pagePath)) {
      const pageData = this.pageDb.get(pagePath).payload
      return pageData
    }
    return undefined
  }

  shouldPrefetch(pagePath) {
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
    if (!this.shouldPrefetch(pagePath)) {
      return false
    }

    // Tell plugins with custom prefetching logic that they should start
    // prefetching this path.
    if (!this.prefetchTriggered.has(pagePath)) {
      this.apiRunner(`onPrefetchPathname`, { pathname: pagePath })
      this.prefetchTriggered.add(pagePath)
    }

    // If a plugin has disabled core prefetching, stop now.
    if (this.prefetchDisabled) {
      return false
    }

    const realPath = findPath(pagePath)
    // Todo make doPrefetch logic cacheable
    // eslint-disable-next-line consistent-return
    this.doPrefetch(realPath).then(() => {
      if (!this.prefetchCompleted.has(pagePath)) {
        this.apiRunner(`onPostPrefetchPathname`, { pathname: pagePath })
        this.prefetchCompleted.add(pagePath)
      }
    })

    return true
  }

  doPrefetch(pagePath) {
    const pageDataUrl = createPageDataUrl(pagePath)
    return prefetchHelper(pageDataUrl, {
      crossOrigin: `anonymous`,
      as: `fetch`,
    }).then(() =>
      // This was just prefetched, so will return a response from
      // the cache instead of making another request to the server
      this.loadPageDataJson(pagePath)
    )
  }

  hovering(rawPath) {
    this.loadPage(rawPath)
  }

  getResourceURLsForPathname(rawPath) {
    const pagePath = findPath(rawPath)
    const page = this.pageDataDb.get(pagePath)
    if (page) {
      const pageResources = toPageResources(page.payload)

      return [
        ...createComponentUrls(pageResources.page.componentChunkName),
        createPageDataUrl(pagePath),
      ]
    } else {
      return null
    }
  }

  isPageNotFound(rawPath) {
    const pagePath = findPath(rawPath)
    const page = this.pageDb.get(pagePath)
    return !page || page.notFound
  }

  loadAppData(retries = 0) {
    return this.memoizedGet(`${__PATH_PREFIX__}/page-data/app-data.json`).then(
      req => {
        const { status, responseText } = req

        let appData

        if (status !== 200 && retries < 3) {
          // Retry 3 times incase of non-200 responses
          return this.loadAppData(retries + 1)
        }

        // Handle 200
        if (status === 200) {
          try {
            const jsonPayload = JSON.parse(responseText)
            if (jsonPayload.webpackCompilationHash === undefined) {
              throw new Error(`not a valid app-data response`)
            }

            appData = jsonPayload
          } catch (err) {
            // continue regardless of error
          }
        }

        return appData
      }
    )
  }
}

const createComponentUrls = componentChunkName =>
  (window.___chunkMapping[componentChunkName] || []).map(
    chunk => __PATH_PREFIX__ + chunk
  )

export class ProdLoader extends BaseLoader {
  constructor(asyncRequires, matchPaths) {
    const loadComponent = chunkName =>
      asyncRequires.components[chunkName]
        ? asyncRequires.components[chunkName]()
            .then(preferDefault)
            // loader will handle the case when component is null
            .catch(() => null)
        : Promise.resolve()

    super(loadComponent, matchPaths)
  }

  doPrefetch(pagePath) {
    return super.doPrefetch(pagePath).then(result => {
      if (result.status !== PageResourceStatus.Success) {
        return Promise.resolve()
      }
      const pageData = result.payload
      const chunkName = pageData.componentChunkName
      const componentUrls = createComponentUrls(chunkName)
      return Promise.all(componentUrls.map(prefetchHelper)).then(() => pageData)
    })
  }

  loadPageDataJson(rawPath) {
    return super.loadPageDataJson(rawPath).then(data => {
      if (data.notFound) {
        // check if html file exist using HEAD request:
        // if it does we should navigate to it instead of showing 404
        return doFetch(rawPath, `HEAD`).then(req => {
          if (req.status === 200) {
            // page (.html file) actually exist (or we asked for 404 )
            // returning page resources status as errored to trigger
            // regular browser navigation to given page
            return {
              status: PageResourceStatus.Error,
            }
          }

          // if HEAD request wasn't 200, return notFound result
          // and show 404 page
          return data
        })
      }
      return data
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
  loadAppData: () => instance.loadAppData(),
}

export default publicLoader

export function getStaticQueryResults() {
  if (instance) {
    return instance.staticQueryDb
  } else {
    return {}
  }
}
