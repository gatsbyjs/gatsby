module.exports = ({ getNextQueuedResources, createResourceDownload }) => {
  let pagesLoading = 0
  let resourcesDownloading = []

  // Do things
  const startResourceDownloading = () => {
    const nextResource = getNextQueuedResources()
    if (nextResource) {
      resourcesDownloading.push(nextResource)
      createResourceDownload(nextResource)
      console.log({ pagesLoading, resourcesDownloading })
    }
  }

  const reducer = action => {
    switch (action.type) {
      case `RESOURCE_FINISHED`:
        console.log(`reducer RESOURCE_FINISHED`, action, resourcesDownloading)
        resourcesDownloading = resourcesDownloading.filter(
          r => r !== action.payload
        )
        break
      case `ON_PRE_LOAD_PAGE_RESOURCES`:
        pagesLoading += 1
        break
      case `ON_POST_LOAD_PAGE_RESOURCES`:
        pagesLoading -= 1
        break
      case `ON_NEW_RESOURCES_ADDED`:
        break
    }

    // Take actions.
    if (resourcesDownloading.length === 0 && pagesLoading === 0) {
      // Start another resource downloading.
      startResourceDownloading()
    }
  }

  return {
    onResourcedFinished: event => {
      // Tell prefetcher that the resource finished downloading
      // so it can grab the next one.
      reducer({ type: `RESOURCE_FINISHED`, payload: event })
    },
    onPreLoadPageResources: event => {
      // Tell prefetcher a page load has started so it should stop
      // loading anything new
      reducer({ type: `ON_PRE_LOAD_PAGE_RESOURCES`, payload: event })
    },
    onPostLoadPageResources: event => {
      // Tell prefetcher a page load has finished so it should start
      // loading resources again.
      reducer({ type: `ON_POST_LOAD_PAGE_RESOURCES`, payload: event })
    },
    onNewResourcesAdded: () => {
      // Tell prefetcher that more resources to be downloaded have
      // been added.
      reducer({ type: `ON_NEW_RESOURCES_ADDED` })
    },
    getState: () => {
      return { pagesLoading, resourcesDownloading }
    },
    empty: () => {
      pagesLoading = 0
      resourcesDownloading = []
    },
  }
}
