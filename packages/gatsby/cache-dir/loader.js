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

const stripSurroundingSlashes = s => {
  s = s[0] === `/` ? s.slice(1) : s
  s = s.endsWith(`/`) ? s.slice(0, -1) : s
  return s
}

const createPageDataUrl = rawPath => {
  const [path, maybeSearch] = rawPath.split(`?`)
  const fixedPath = path === `/` ? `index` : stripSurroundingSlashes(path)
  return `${__PATH_PREFIX__}/page-data/${fixedPath}/page-data.json${
    maybeSearch ? `?${maybeSearch}` : ``
  }`
}

function doFetch(url, method = `GET`) {
  return new Promise(resolve => {
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

// Regex that matches common search crawlers
const BOT_REGEX = /bot|crawler|spider|crawling/i

const toPageResources = (pageData, component = null, head) => {
  const page = {
    componentChunkName: pageData.componentChunkName,
    path: pageData.path,
    webpackCompilationHash: pageData.webpackCompilationHash,
    matchPath: pageData.matchPath,
    staticQueryHashes: pageData.staticQueryHashes,
    getServerDataError: pageData.getServerDataError,
  }

  return {
    component,
    head,
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
    this.isPrefetchQueueRunning = false
    this.prefetchQueued = []
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

          const maybeSearch = pagePath.split(`?`)[1]
          if (maybeSearch && !jsonPayload.path.includes(maybeSearch)) {
            jsonPayload.path += `?${maybeSearch}`
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
        // If the request was for a 404/500 page and it doesn't exist, we're done
        if (pagePath === `/404.html` || pagePath === `/500.html`) {
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
        return this.fetchPageDataJson(
          Object.assign(loadObj, {
            pagePath: `/500.html`,
            internalServerError: true,
          })
        )
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
      if (process.env.BUILD_STAGE !== `develop` || !pageData.stale) {
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
      if (process.env.BUILD_STAGE !== `develop` || !page.payload.stale) {
        if (page.error) {
          return {
            error: page.error,
            status: page.status,
          }
        }

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

      // In develop we have separate chunks for template and Head components
      // to enable HMR (fast refresh requires single exports).
      // In production we have shared chunk with both exports. Double loadComponent here
      // will be deduped by webpack runtime resulting in single request and single module
      // being loaded for both `component` and `head`.
      const componentChunkPromise = Promise.all([
        this.loadComponent(componentChunkName),
        this.loadComponent(componentChunkName, `head`),
      ]).then(([component, head]) => {
        finalResult.createdAt = new Date()
        let pageResources
        if (!component || component instanceof Error) {
          finalResult.status = PageResourceStatus.Error
          finalResult.error = component
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
          pageResources = toPageResources(pageData, component, head)
        }
        // undefined if final result is an error
        return pageResources
      })

      const staticQueryBatchPromise = Promise.all(
        staticQueryHashes.map(staticQueryHash => {
          // Check for cache in case this static query result has already been loaded
          if (this.staticQueryDb[staticQueryHash]) {
            const jsonPayload = this.staticQueryDb[staticQueryHash]
            return { staticQueryHash, jsonPayload }
          }

          return this.memoizedGet(
            `${__PATH_PREFIX__}/page-data/sq/d/${staticQueryHash}.json`
          )
            .then(req => {
              const jsonPayload = JSON.parse(req.responseText)
              return { staticQueryHash, jsonPayload }
            })
            .catch(() => {
              throw new Error(
                `We couldn't load "${__PATH_PREFIX__}/page-data/sq/d/${staticQueryHash}.json"`
              )
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

      return (
        Promise.all([componentChunkPromise, staticQueryBatchPromise])
          .then(([pageResources, staticQueryResults]) => {
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

            if (finalResult.error) {
              return {
                error: finalResult.error,
                status: finalResult.status,
              }
            }

            return payload
          })
          // when static-query fail to load we throw a better error
          .catch(err => {
            return {
              error: err,
              status: PageResourceStatus.Error,
            }
          })
      )
    })

    inFlightPromise
      .then(() => {
        this.inFlightDb.delete(pagePath)
      })
      .catch(error => {
        this.inFlightDb.delete(pagePath)
        throw error
      })

    this.inFlightDb.set(pagePath, inFlightPromise)

    return inFlightPromise
  }

  // returns undefined if the page does not exists in cache
  loadPageSync(rawPath, options = {}) {
    const pagePath = findPath(rawPath)
    if (this.pageDb.has(pagePath)) {
      const pageData = this.pageDb.get(pagePath)

      if (pageData.payload) {
        return pageData.payload
      }

      if (options?.withErrorDetails) {
        return {
          error: pageData.error,
          status: pageData.status,
        }
      }
    }
    return undefined
  }

  shouldPrefetch(pagePath) {
    // Skip prefetching if we know user is on slow or constrained connection
    if (!doesConnectionSupportPrefetch()) {
      return false
    }

    // Don't prefetch if this is a crawler bot
    if (navigator.userAgent && BOT_REGEX.test(navigator.userAgent)) {
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
      return {
        then: resolve => resolve(false),
        abort: () => {},
      }
    }
    if (this.prefetchTriggered.has(pagePath)) {
      return {
        then: resolve => resolve(true),
        abort: () => {},
      }
    }

    const defer = {
      resolve: null,
      reject: null,
      promise: null,
    }
    defer.promise = new Promise((resolve, reject) => {
      defer.resolve = resolve
      defer.reject = reject
    })
    this.prefetchQueued.push([pagePath, defer])
    const abortC = new AbortController()
    abortC.signal.addEventListener(`abort`, () => {
      const index = this.prefetchQueued.findIndex(([p]) => p === pagePath)
      // remove from the queue
      if (index !== -1) {
        this.prefetchQueued.splice(index, 1)
      }
    })

    if (!this.isPrefetchQueueRunning) {
      this.isPrefetchQueueRunning = true
      setTimeout(() => {
        this._processNextPrefetchBatch()
      }, 3000)
    }

    return {
      then: (resolve, reject) => defer.promise.then(resolve, reject),
      abort: abortC.abort.bind(abortC),
    }
  }

  _processNextPrefetchBatch() {
    const idleCallback = window.requestIdleCallback || (cb => setTimeout(cb, 0))

    idleCallback(() => {
      const toPrefetch = this.prefetchQueued.splice(0, 4)
      const prefetches = Promise.all(
        toPrefetch.map(([pagePath, dPromise]) => {
          // Tell plugins with custom prefetching logic that they should start
          // prefetching this path.
          if (!this.prefetchTriggered.has(pagePath)) {
            this.apiRunner(`onPrefetchPathname`, { pathname: pagePath })
            this.prefetchTriggered.add(pagePath)
          }

          // If a plugin has disabled core prefetching, stop now.
          if (this.prefetchDisabled) {
            return dPromise.resolve(false)
          }

          return this.doPrefetch(findPath(pagePath)).then(() => {
            if (!this.prefetchCompleted.has(pagePath)) {
              this.apiRunner(`onPostPrefetchPathname`, { pathname: pagePath })
              this.prefetchCompleted.add(pagePath)
            }

            dPromise.resolve(true)
          })
        })
      )

      if (this.prefetchQueued.length) {
        prefetches.then(() => {
          setTimeout(() => {
            this._processNextPrefetchBatch()
          }, 3000)
        })
      } else {
        this.isPrefetchQueueRunning = false
      }
    })
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
  constructor(asyncRequires, matchPaths, pageData) {
    const loadComponent = chunkName => {
      if (!asyncRequires.components[chunkName]) {
        throw new Error(
          `We couldn't find the correct component chunk with the name ${chunkName}`
        )
      }

      return (
        asyncRequires.components[chunkName]()
          // loader will handle the case when component is error
          .catch(err => err)
      )
    }

    super(loadComponent, matchPaths)

    if (pageData) {
      this.pageDataDb.set(findPath(pageData.path), {
        pagePath: pageData.path,
        payload: pageData,
        status: `success`,
      })
    }
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
  enqueue: rawPath => instance.prefetch(rawPath),

  // Real methods
  getResourceURLsForPathname: rawPath =>
    instance.getResourceURLsForPathname(rawPath),
  loadPage: rawPath => instance.loadPage(rawPath),
  // TODO add deprecation to v4 so people use withErrorDetails and then we can remove in v5 and change default behaviour
  loadPageSync: (rawPath, options = {}) =>
    instance.loadPageSync(rawPath, options),
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
