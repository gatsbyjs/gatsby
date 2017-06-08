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
    prefetcher.onPreLoadPageResources()
    prefetcher.onPreLoadPageResources()
    expect(prefetcher.getState().pagesLoading).toEqual(2)
  })

  test(`It tracks when pages finish loading`, () => {
    prefetcher.onPreLoadPageResources()
    prefetcher.onPostLoadPageResources()
    expect(prefetcher.getState().pagesLoading).toEqual(0)
  })

  test(`When a new resource is queued, it tries to download it`, () => {
    prefetcher.onNewResourcesAdded()
    expect(createResourceDownload.mock.calls.length).toBe(1)
  })

  test(`If page resources are downloading, it doesn't prefetch until after it's finished`, () => {
    prefetcher.onPreLoadPageResources()
    prefetcher.onNewResourcesAdded()
    expect(createResourceDownload.mock.calls.length).toBe(0)
    prefetcher.onPostLoadPageResources()
    expect(createResourceDownload.mock.calls.length).toBe(1)
  })

  test(`Once one resource finishes downloading, it starts another`, () => {
    prefetcher.onNewResourcesAdded()
    // Get resource name
    const resourceName = createResourceDownload.mock.calls[0][0]

    // New resources added shouldn't trigger new downloads.
    prefetcher.onNewResourcesAdded()
    prefetcher.onNewResourcesAdded()
    expect(createResourceDownload.mock.calls.length).toBe(1)

    // Finish the first download triggers another download.
    prefetcher.onResourcedFinished(resourceName)
    expect(createResourceDownload.mock.calls.length).toBe(2)
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
