let prefetcher
let createResourceDownload

describe(`Loader`, () => {
  beforeEach(() => {
    createResourceDownload = jest.fn()
    prefetcher = require(`../prefetcher.js`)({
      getNextQueuedResources: () => Math.random(),
      createResourceDownload,
    })
    prefetcher.empty()
  })

  test(`It tracks when pages are loading`, () => {
    prefetcher.onPreLoadPageResources({ path: `/` })
    prefetcher.onPreLoadPageResources({ path: `/` })
    expect(prefetcher.getState().pagesLoading).toEqual([`/`, `/`])
  })

  test(`It tracks when pages finish loading`, () => {
    prefetcher.onPreLoadPageResources({ path: `/` })
    prefetcher.onPostLoadPageResources({ page: { path: `/` } })
    expect(prefetcher.getState().pagesLoading).toEqual([])
  })

  test(`When a new resource is queued, it tries to download it`, done => {
    prefetcher.onNewResourcesAdded()
    setTimeout(() => {
      expect(createResourceDownload.mock.calls.length).toBe(1)
      done()
    }, 0)
  })

  test(`If page resources are downloading, it doesn't prefetch until after it's finished`, done => {
    prefetcher.onPreLoadPageResources({ path: `/` })
    prefetcher.onNewResourcesAdded()
    setTimeout(() => {
      expect(createResourceDownload.mock.calls.length).toBe(0)
      prefetcher.onPostLoadPageResources({ page: { path: `/` } })
      setTimeout(() => {
        expect(createResourceDownload.mock.calls.length).toBe(1)
        done()
      }, 0)
    }, 0)
  })

  test(`Once one resource finishes downloading, it starts another`, done => {
    prefetcher.onNewResourcesAdded()
    setTimeout(() => {
      // Get resource name
      const resourceName = createResourceDownload.mock.calls[0][0]
      // New resources added shouldn't trigger new downloads.
      prefetcher.onNewResourcesAdded()
      prefetcher.onNewResourcesAdded()
      setTimeout(() => {
        expect(createResourceDownload.mock.calls.length).toBe(1)
        // Finish the first download triggers another download.
        prefetcher.onResourcedFinished(resourceName)
        setTimeout(() => {
          expect(createResourceDownload.mock.calls.length).toBe(2)
          done()
        }, 0)
      }, 0)
    }, 0)
  })

  test(`It stops downloading when the resourcesArray is empty`, () => {
    prefetcher = require(`../prefetcher.js`)({
      getNextQueuedResources: () => undefined,
      createResourceDownload: jest.fn(),
    })
    prefetcher.empty()

    prefetcher.onNewResourcesAdded()
    expect(createResourceDownload.mock.calls.length).toBe(0)
  })
})
