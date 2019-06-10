import { BaseLoader } from "./loader"

class DevLoader extends BaseLoader {
  constructor(syncRequires, matchPaths) {
    const loadComponent = chunkName =>
      Promise.resolve(syncRequires.components[chunkName])
    super(loadComponent, matchPaths)
  }

  loadPage(pagePath) {
    return super.loadPage(pagePath).then(result => {
      require(`./socketIo`).getPageData(pagePath)
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

    require(`./socketIo`).getPageData(pagePath)
  }
}

export default DevLoader
