// @flow

type PrefetcherOptions = {
  fetchNextResource: () => ?Promise,
};

module.exports = (
  { fetchNextResource }: PrefetcherOptions
) => {
  let pagesLoading = []
  let current = null
  const clearCurrent = () => {
    current = null
  }

  const enqueueUpdate = () => {
    // Take actions.
    // Wait for event loop queue to finish.
    setTimeout(() => {
      if (current || !!pagesLoading.length) return

      // Start another resource downloading.
      let next = fetchNextResource()
      if (!next) return
      current = next
        .then(clearCurrent, clearCurrent)
        .then(enqueueUpdate)
    })
  }

  const reducer = action => {
    switch (action.type) {
      case `ON_PRE_LOAD_PAGE_RESOURCES`:
        pagesLoading.push(action.payload.path)
        break
      case `ON_POST_LOAD_PAGE_RESOURCES`:
        pagesLoading = pagesLoading.filter(p => p !== action.payload.page.path)
        break
      case `ON_NEW_RESOURCES_ADDED`:
        break
    }

    enqueueUpdate()
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
      return { pagesLoading, current }
    },
    empty: () => {
      pagesLoading = []
      clearCurrent()
    },
  }
}
