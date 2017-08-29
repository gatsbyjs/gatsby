let prefetcher
let fetchNextResource
let fetches

const getDeferred = (result) => {
  let resolve;
  let promise = new Promise(r => {
    resolve = () => r(result)
  })
  return [promise, resolve]
}

describe(`Loader`, () => {
  beforeEach(() => {
    fetches = []
    fetchNextResource = jest.fn(() => {
      let result = Promise.resolve(Math.random())
      fetches.push(result)
      return result
    })
    prefetcher = require(`../prefetcher.js`)({ fetchNextResource })
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
      expect(fetchNextResource.mock.calls.length).toBe(1)
      done()
    }, 0)
  })

  test(`If page resources are downloading, it doesn't prefetch until after it's finished`, done => {
    prefetcher.onPreLoadPageResources({ path: `/` })
    prefetcher.onNewResourcesAdded()
    setTimeout(() => {
      expect(fetchNextResource.mock.calls.length).toBe(0)
      prefetcher.onPostLoadPageResources({ page: { path: `/` } })
      setTimeout(() => {
        expect(fetchNextResource.mock.calls.length).toBe(1)
        done()
      }, 0)
    }, 0)
  })

  test(`Once one resource finishes downloading, it starts another`, done => {
    let request, resolve
    fetchNextResource = jest.fn(() => {
      ;[request, resolve] = getDeferred(Math.random())
      return request
    })

    prefetcher = require(`../prefetcher.js`)({ fetchNextResource })
    prefetcher.onNewResourcesAdded()

    setTimeout(() => {
      // Get resource name
      expect(fetchNextResource.mock.calls.length).toBe(1)

      // New resources added shouldn't trigger new downloads
      // while we are still processing one.
      prefetcher.onNewResourcesAdded()
      prefetcher.onNewResourcesAdded()

      setTimeout(() => {
        expect(fetchNextResource.mock.calls.length).toBe(1)
        // Finish the first download triggers another download.
        resolve()

        setTimeout(() => {
          expect(fetchNextResource.mock.calls.length).toBe(2)
          done()
        }, 10)
      })
    })
  })
})
