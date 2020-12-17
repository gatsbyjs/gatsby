import { BaseLoader, PageResourceStatus } from "./loader"
import { findPath } from "./find-path"

import getSocket from "./socketIo"
import normalizePagePath from "./normalize-page-path"

// TODO move away from lodash
import isEqual from "lodash/isEqual"

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
          this.handleStaticQueryResultHotUpdate(msg)
        } else if (msg.type === `pageQueryResult`) {
          this.handlePageQueryResultHotUpdate(msg)
        } else if (msg.type === `stalePageData`) {
          this.handleStalePageDataMessage(msg)
        }
      })
    } else if (process.env.NODE_ENV !== `test`) {
      console.warn(`Could not get web socket`)
    }
  }

  loadPage(pagePath) {
    const realPath = findPath(pagePath)
    return super.loadPage(realPath).then(result => {
      if (this.isPageNotFound(realPath)) {
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
          `404 page could not be found. Checkout https://www.gatsbyjs.org/docs/how-to/adding-common-features/add-404-page/`
        )
        return this.loadPageDataJson(`/dev-404-page/`).then(result =>
          Object.assign({}, data, result)
        )
      }

      return data
    })
  }

  doPrefetch(pagePath) {
    if (process.env.GATSBY_EXPERIMENTAL_QUERY_ON_DEMAND) {
      return Promise.resolve()
    }
    return super.doPrefetch(pagePath).then(result => result.payload)
  }

  handleStaticQueryResultHotUpdate(msg) {
    const newResult = msg.payload.result

    const cacheKey = msg.payload.id
    const cachedResult = this.staticQueryDb[cacheKey]
    if (!isEqual(newResult, cachedResult)) {
      this.staticQueryDb[cacheKey] = newResult
      ___emitter.emit(`staticQueryResult`, newResult)
    }
  }

  handlePageQueryResultHotUpdate(msg) {
    const newPageData = msg.payload.result

    const pageDataDbCacheKey = normalizePagePath(msg.payload.id)
    const cachedPageData = this.pageDataDb.get(pageDataDbCacheKey)?.payload

    if (!isEqual(newPageData, cachedPageData)) {
      // TODO: if this is update for current page and there are any new static queries added
      // that are not yet cached, there is currently no trigger to fetch them (yikes)
      // always update canonical key for pageDataDb
      this.pageDataDb.set(pageDataDbCacheKey, {
        pagePath: pageDataDbCacheKey,
        payload: newPageData,
        status: `success`,
      })

      const cachedPage = this.pageDb.get(pageDataDbCacheKey)
      if (cachedPage) {
        this.pageDb.set(
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
          const previousPageDataEntry = this.pageDataDb.get(notFoundPath)
          if (previousPageDataEntry) {
            this.pageDataDb.set(notFoundPath, {
              ...previousPageDataEntry,
              payload: newPageData,
            })
          }

          const previousPageEntry = this.pageDb.get(notFoundPath)
          if (previousPageEntry) {
            this.pageDb.set(
              notFoundPath,
              mergePageEntry(previousPageEntry, newPageData)
            )
          }
        })
      }

      ___emitter.emit(`pageQueryResult`, newPageData)
    }
  }

  handleStalePageDataMessage(msg) {
    msg.payload.stalePageDataPaths.forEach(dirtyQueryId => {
      if (dirtyQueryId === `/dev-404-page/` || dirtyQueryId === `/404.html`) {
        // those pages are not on demand so skipping
        return
      }

      const normalizedId = normalizePagePath(dirtyQueryId)

      // We can't just delete items in caches, because then
      // using history.back() would show dev-404 page
      // due to our special handling of it in root.js (loader.isPageNotFound check)
      // so instead we mark it as stale and instruct loader's async methods
      // to refetch resources if they are marked as stale

      const cachedPageData = this.pageDataDb.get(normalizedId)
      if (cachedPageData) {
        // if we have page data in cache, mark it as stale
        this.pageDataDb.set(normalizedId, {
          ...cachedPageData,
          stale: true,
        })
      }

      const cachedPage = this.pageDb.get(normalizedId)
      if (cachedPage) {
        // if we have page data in cache, mark it as stale
        this.pageDb.set(normalizedId, {
          ...cachedPage,
          payload: { ...cachedPage.payload, stale: true },
        })
      }
    })
  }
}

export default DevLoader
