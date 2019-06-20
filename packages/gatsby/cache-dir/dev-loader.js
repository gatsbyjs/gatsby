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

  loadPageDataJson(rawPath) {
    return super.loadPageDataJson(rawPath).then(data => {
      // when we can't find a proper 404.html we fallback to dev-404-page
      if (data.status === `failure`) {
        return this.loadPageDataJson(`/dev-404-page/`)
      }

      return data
    })
  }

  doPrefetch(pagePath) {
    return Promise.resolve(require(`./socketIo`).getPageData(pagePath))
  }
}

export default DevLoader
