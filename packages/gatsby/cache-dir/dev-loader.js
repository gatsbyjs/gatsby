import { BaseLoader, PageResourceStatus } from "./loader"
import { findPath } from "./find-path"

class DevLoader extends BaseLoader {
  constructor(lazySyncRequires, matchPaths) {
    const loadComponent = (chunkName, path) => {
      const realPath = findPath(path)
      delete require.cache[
        require.resolve(`$virtual/lazy-client-sync-requires`)
      ]
      const lazyRequires = require(`$virtual/lazy-client-sync-requires`)
      console.log(`loadComponent`, { chunkName, lazyRequires })
      if (lazyRequires.lazyComponents[chunkName]) {
        return Promise.resolve(lazyRequires.lazyComponents[chunkName])
      } else {
        console.log(`trigger compilation on the server for`, chunkName)
        return new Promise(resolve => {
          // do the work
          const req = new XMLHttpRequest()
          req.open(`post`, `/___client-page-visited`, true)
          req.setRequestHeader(`Content-Type`, `application/json;charset=UTF-8`)
          req.send(JSON.stringify({ chunkName }))

          // Timeout after 3 seconds and hard refresh — webpack seems to
          // fail a lot on updates for some reason.
          const timeoutTimer = setTimeout(() => {
            console.log(`timeoutTimer — now navigating to`, realPath)
            clearInterval(checkForUpdates)
            clearTimeout(timeoutTimer)
            // window.location.href = realPath
            window.location.assign(realPath)
          }, 3000)

          const checkForUpdates = setInterval(() => {
            let lazyRequires = require(`$virtual/lazy-client-sync-requires`)
            console.log(lazyRequires.lazyComponents[chunkName])
            delete require.cache[
              require.resolve(`$virtual/lazy-client-sync-requires`)
            ]
            lazyRequires = require(`$virtual/lazy-client-sync-requires`)
            console.log(`polling for updates`, { lazyRequires, chunkName })
            if (lazyRequires.lazyComponents[chunkName]) {
              console.log(`found page component`)
              clearInterval(checkForUpdates)
              clearTimeout(timeoutTimer)
              resolve(lazyRequires.lazyComponents[chunkName])
            }
          }, 250)
        })
      }
    }
    super(loadComponent, matchPaths)
  }

  loadPage(pagePath) {
    const realPath = findPath(pagePath)
    return super.loadPage(realPath).then(result =>
      require(`./socketIo`)
        .getPageData(realPath)
        .then(() => result)
    )
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
    return Promise.resolve(require(`./socketIo`).getPageData(pagePath))
  }
}

export default DevLoader
