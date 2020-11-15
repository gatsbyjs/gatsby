import {
  BaseLoader,
  PageResourceStatus,
  getStaticQueryResults,
  getPageDataDb,
  getPageDb,
} from "./loader"
import { findPath } from "./find-path"
import getSocket from "./socketIo"
import normalizePagePath from "./normalize-page-path"

function didDataChange(a, b) {
  return JSON.stringify(a) !== JSON.stringify(b)
}

function mergePageEntry(cachedPage, newPageData) {
  return {
    ...cachedPage,
    payload: {
      ...cachedPage.payload,
      json: newPageData.result,
      page: {
        ...cachedPage.payload.page,
        staticQueryResults: newPageData.staticQueryResults,
      },
    },
  }
}

class DevLoader extends BaseLoader {
  constructor(syncRequires, matchPaths) {
    const loadComponent = chunkName =>
      Promise.resolve(syncRequires.components[chunkName])
    super(loadComponent, matchPaths)

    const socket = getSocket()

    this.notFoundPagePathsInCaches = new Set()

    if (socket) {
      socket.on(`message`, msg => {
        if (msg.type === `staticQueryResult`) {
          const newResult = msg.payload.result

          const cacheKey = msg.payload.id
          const cachedStaticQueries = getStaticQueryResults()
          const cachedResult = cachedStaticQueries[cacheKey]
          if (didDataChange(newResult, cachedResult)) {
            cachedStaticQueries[cacheKey] = newResult
            ___emitter.emit(`staticQueryResult`, newResult)
          }
        } else if (msg.type === `pageQueryResult`) {
          const newPageData = msg.payload.result

          const pageDataDbCacheKey = normalizePagePath(msg.payload.id)
          const cachedPageDataDb = getPageDataDb()
          const cachedPageData = cachedPageDataDb.get(pageDataDbCacheKey)
            ?.payload

          if (didDataChange(newPageData, cachedPageData)) {
            // always update canonical key for pageDataDb
            cachedPageDataDb.set(pageDataDbCacheKey, {
              pagePath: pageDataDbCacheKey,
              payload: newPageData,
              status: `success`,
            })

            const cachedPageDb = getPageDb()
            const cachedPage = cachedPageDb.get(pageDataDbCacheKey)
            if (cachedPage) {
              cachedPageDb.set(
                pageDataDbCacheKey,
                mergePageEntry(cachedPage, newPageData)
              )
            }

            // Additionally if those are query results for "/404.html"
            // we have to update all paths user wanted to visit, but didn't have
            // page for it, because we do store them under (normalized) path
            // user wanted to visit
            if (pageDataDbCacheKey === `/404.html`) {
              this.notFoundPagePathsInCaches.forEach(notFoundPath => {
                const previousPageDataEntry = cachedPageDataDb.get(notFoundPath)
                if (previousPageDataEntry) {
                  cachedPageDataDb.set(notFoundPath, {
                    ...previousPageDataEntry,
                    payload: newPageData,
                  })
                }

                const previousPageEntry = cachedPageDb.get(notFoundPath)
                if (previousPageEntry) {
                  cachedPageDb.set(
                    notFoundPath,
                    mergePageEntry(previousPageEntry, newPageData)
                  )
                }
              })
            }

            ___emitter.emit(`pageQueryResult`, newPageData)
          }
        }
      })
    } else {
      console.warn(`Could not get web socket`)
    }
  }

  loadPage(pagePath) {
    const realPath = findPath(pagePath)
    return super.loadPage(realPath).then(result => {
      const isNotFound = this.pageDb.get(realPath)?.notFound

      if (isNotFound) {
        this.notFoundPagePathsInCaches.add(realPath)
      }

      return result
    })
  }

  loadPageDataJson(rawPath) {
    return super.loadPageDataJson(rawPath).then(data => {
      // when we can't find a proper 404.html we fallback to dev-404-page
      // we need to make sure to mark it as not found.
      if (
        data.status === PageResourceStatus.Error &&
        rawPath !== `/dev-404-page/`
      ) {
        console.error(
          `404 page could not be found. Checkout https://www.gatsbyjs.org/docs/add-404-page/`
        )
        return this.loadPageDataJson(`/dev-404-page/`).then(result =>
          Object.assign({}, data, result)
        )
      }

      return data
    })
  }

  doPrefetch(pagePath) {
    return super.doPrefetch(pagePath).then(result => {
      const pageData = result.payload
      return pageData
    })
  }
}

export default DevLoader
