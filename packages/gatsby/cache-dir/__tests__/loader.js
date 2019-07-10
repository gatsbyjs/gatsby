// This is by no means a full test file for loader.js so feel free to add more tests.
import mock from "xhr-mock"
import { BaseLoader } from "../loader"
import emitter from "../emitter"

jest.mock(`../emitter`)

describe(`BaseLoader`, () => {
  describe(`loadPageDataJson`, () => {
    let originalBasePath
    let originalPathPrefix
    let xhrCount

    /**
     * @param {string} path
     * @param {number} status
     * @param {string|Object?} responseText
     * @param {boolean?} json
     */
    const mockPageData = (path, status, responseText = ``, json = false) => {
      mock.get(`/page-data${path}/page-data.json`, (req, res) => {
        xhrCount++
        if (json) {
          res.header(`content-type`, `application/json`)
        }

        return res
          .status(status)
          .body(
            typeof responseText === `string`
              ? responseText
              : JSON.stringify(responseText)
          )
      })
    }

    const defaultPayload = {
      path: `/mypage/`,
      webpackCompilationHash: `1234`,
    }

    // replace the real XHR object with the mock XHR object before each test
    beforeEach(() => {
      originalBasePath = global.__BASE_PATH__
      originalPathPrefix = global.__PATH_PREFIX__
      global.__BASE_PATH__ = ``
      global.__PATH_PREFIX__ = ``
      xhrCount = 0
      mock.setup()
    })

    // put the real XHR object back and clear the mocks after each test
    afterEach(() => {
      global.__BASE_PATH__ = originalBasePath
      global.__PATH_PREFIX__ = originalPathPrefix
      mock.teardown()
    })

    it(`should return a pageData json on success`, async () => {
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/mypage`, 200, defaultPayload, true)

      const expectation = {
        status: `success`,
        pagePath: `/mypage`,
        payload: defaultPayload,
      }
      expect(await baseLoader.loadPageDataJson(`/mypage/`)).toEqual(expectation)
      expect(baseLoader.pageDataDb.get(`/mypage`)).toEqual(expectation)
      expect(xhrCount).toBe(1)
    })

    it(`should return a pageData json on success without contentType`, async () => {
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/mypage`, 200, defaultPayload)

      const expectation = {
        status: `success`,
        pagePath: `/mypage`,
        payload: defaultPayload,
      }
      expect(await baseLoader.loadPageDataJson(`/mypage/`)).toEqual(expectation)
      expect(baseLoader.pageDataDb.get(`/mypage`)).toEqual(expectation)
      expect(xhrCount).toBe(1)
    })

    it(`should return a pageData json with an empty compilation hash (gatsby develop)`, async () => {
      const baseLoader = new BaseLoader(null, [])

      const payload = { ...defaultPayload, webpackCompilationHash: `` }
      mockPageData(`/mypage`, 200, payload)

      const expectation = {
        status: `success`,
        pagePath: `/mypage`,
        payload,
      }
      expect(await baseLoader.loadPageDataJson(`/mypage/`)).toEqual(expectation)
      expect(baseLoader.pageDataDb.get(`/mypage`)).toEqual(expectation)
      expect(xhrCount).toBe(1)
    })

    it(`should load a 404 page when page-path file is not a gatsby json`, async () => {
      const baseLoader = new BaseLoader(null, [])

      const payload = { ...defaultPayload, path: `/404.html/` }
      mockPageData(`/unknown-page`, 200, { random: `string` }, true)
      mockPageData(`/404.html`, 200, payload, true)

      const expectation = {
        status: `success`,
        pagePath: `/404.html`,
        notFound: true,
        payload,
      }
      expect(await baseLoader.loadPageDataJson(`/unknown-page/`)).toEqual(
        expectation
      )
      expect(baseLoader.pageDataDb.get(`/unknown-page`)).toEqual(expectation)
      expect(xhrCount).toBe(2)
    })

    it(`should load a 404 page when page-path file is not a json`, async () => {
      const baseLoader = new BaseLoader(null, [])

      const payload = { ...defaultPayload, path: `/404.html/` }
      mockPageData(`/unknown-page`, 200)
      mockPageData(`/404.html`, 200, payload, true)

      const expectation = {
        status: `success`,
        pagePath: `/404.html`,
        notFound: true,
        payload,
      }
      expect(await baseLoader.loadPageDataJson(`/unknown-page/`)).toEqual(
        expectation
      )
      expect(baseLoader.pageDataDb.get(`/unknown-page`)).toEqual(expectation)
      expect(xhrCount).toBe(2)
    })

    it(`should load a 404 page when path returns a 404`, async () => {
      const baseLoader = new BaseLoader(null, [])

      const payload = { ...defaultPayload, path: `/404.html/` }
      mockPageData(`/unknown-page`, 200)
      mockPageData(`/404.html`, 200, payload, true)

      const expectation = {
        status: `success`,
        pagePath: `/404.html`,
        notFound: true,
        payload,
      }
      expect(await baseLoader.loadPageDataJson(`/unknown-page/`)).toEqual(
        expectation
      )
      expect(baseLoader.pageDataDb.get(`/unknown-page`)).toEqual(expectation)
      expect(xhrCount).toBe(2)
    })

    it(`should return a failure when status is 404 and 404 page is fetched`, async () => {
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/unknown-page`, 404)
      mockPageData(`/404.html`, 404)

      const expectation = {
        status: `failure`,
        pagePath: `/404.html`,
        notFound: true,
      }
      expect(await baseLoader.loadPageDataJson(`/unknown-page/`)).toEqual(
        expectation
      )
      expect(baseLoader.pageDataDb.get(`/unknown-page`)).toEqual(expectation)
      expect(xhrCount).toBe(2)
    })

    it(`should return an error when status is 500`, async () => {
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/error-page`, 500)

      const expectation = {
        status: `error`,
        pagePath: `/error-page`,
      }
      expect(await baseLoader.loadPageDataJson(`/error-page/`)).toEqual(
        expectation
      )
      expect(baseLoader.pageDataDb.get(`/error-page`)).toEqual(expectation)
      expect(xhrCount).toBe(1)
    })

    it(`should retry 3 times before returning an error`, async () => {
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/blocked-page`, 0)

      const expectation = {
        status: `error`,
        retries: 3,
        pagePath: `/blocked-page`,
      }
      expect(await baseLoader.loadPageDataJson(`/blocked-page/`)).toEqual(
        expectation
      )
      expect(baseLoader.pageDataDb.get(`/blocked-page`)).toEqual(expectation)
      expect(xhrCount).toBe(4)
    })

    it(`should recover if we get 1 failure`, async () => {
      const baseLoader = new BaseLoader(null, [])
      const payload = {
        path: `/blocked-page/`,
        webpackCompilationHash: `1234`,
      }

      let xhrCount = 0
      mock.get(`/page-data/blocked-page/page-data.json`, (req, res) => {
        if (xhrCount++ === 0) {
          return res.status(0).body(``)
        } else {
          res.header(`content-type`, `application/json`)
          return res.status(200).body(JSON.stringify(payload))
        }
      })

      const expectation = {
        status: `success`,
        retries: 1,
        pagePath: `/blocked-page`,
        payload,
      }
      expect(await baseLoader.loadPageDataJson(`/blocked-page/`)).toEqual(
        expectation
      )
      expect(baseLoader.pageDataDb.get(`/blocked-page`)).toEqual(expectation)
      expect(xhrCount).toBe(2)
    })

    it(`shouldn't load pageData multiple times`, async () => {
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/mypage`, 200, defaultPayload, true)

      const expectation = await baseLoader.loadPageDataJson(`/mypage/`)
      expect(await baseLoader.loadPageDataJson(`/mypage/`)).toBe(expectation)
      expect(xhrCount).toBe(1)
    })
  })
  describe(`loadPage`, () => {
    beforeEach(() => emitter.emit.mockReset())

    it(`should be successful when component can be loaded`, async () => {
      const baseLoader = new BaseLoader(() => Promise.resolve(`instance`), [])
      const pageData = {
        path: `/mypage/`,
        componentChunkName: `chunk`,
        webpackCompilationHash: `123`,
        result: {
          pageContext: `something something`,
        },
      }
      baseLoader.loadPageDataJson = jest.fn(() =>
        Promise.resolve({
          payload: pageData,
          status: `success`,
        })
      )

      const expectation = await baseLoader.loadPage(`/mypage/`)
      expect(expectation).toMatchSnapshot()
      expect(Object.keys(expectation)).toEqual([`component`, `json`, `page`])
      expect(baseLoader.pageDb.get(`/mypage`)).toEqual(
        expect.objectContaining({
          payload: expectation,
          status: `success`,
        })
      )
      expect(emitter.emit).toHaveBeenCalledTimes(1)
      expect(emitter.emit).toHaveBeenCalledWith(`onPostLoadPageResources`, {
        page: expectation,
        pageResources: expectation,
      })
    })

    it(`should set not found on finalResult`, async () => {
      const baseLoader = new BaseLoader(() => Promise.resolve(`instance`), [])
      const pageData = {
        path: `/mypage/`,
        componentChunkName: `chunk`,
        webpackCompilationHash: `123`,
      }
      baseLoader.loadPageDataJson = jest.fn(() =>
        Promise.resolve({
          payload: pageData,
          status: `success`,
          notFound: true,
        })
      )

      await baseLoader.loadPage(`/mypage/`)
      const expectation = baseLoader.pageDb.get(`/mypage`)
      expect(expectation).toHaveProperty(`notFound`, true)
      expect(emitter.emit).toHaveBeenCalledTimes(1)
      expect(emitter.emit).toHaveBeenCalledWith(`onPostLoadPageResources`, {
        page: expectation.payload,
        pageResources: expectation.payload,
      })
    })

    it(`should return an error when component cannot be loaded`, async () => {
      const baseLoader = new BaseLoader(() => Promise.resolve(false), [])
      const pageData = {
        path: `/mypage/`,
        componentChunkName: `chunk`,
        webpackCompilationHash: `123`,
      }
      baseLoader.loadPageDataJson = jest.fn(() =>
        Promise.resolve({
          payload: pageData,
          status: `success`,
        })
      )

      await baseLoader.loadPage(`/mypage/`)
      const expectation = baseLoader.pageDb.get(`/mypage`)
      expect(expectation).toHaveProperty(`status`, `error`)
      expect(emitter.emit).toHaveBeenCalledTimes(0)
    })

    it(`should return an error pageData contains an error`, async () => {
      const baseLoader = new BaseLoader(() => Promise.resolve(`instance`), [])
      const pageData = {
        path: `/mypage/`,
        componentChunkName: `chunk`,
        webpackCompilationHash: `123`,
      }
      baseLoader.loadPageDataJson = jest.fn(() =>
        Promise.resolve({
          payload: pageData,
          status: `error`,
        })
      )

      expect(await baseLoader.loadPage(`/mypage/`)).toEqual({ status: `error` })
      expect(baseLoader.pageDb.size).toBe(0)
      expect(emitter.emit).toHaveBeenCalledTimes(0)
    })

    it(`should throw an error when 404 cannot be fetched`, async () => {
      const baseLoader = new BaseLoader(() => Promise.resolve(`instance`), [])

      baseLoader.loadPageDataJson = jest.fn(() =>
        Promise.resolve({
          status: `failure`,
        })
      )

      try {
        await baseLoader.loadPage(`/404.html/`)
      } catch (err) {
        expect(err.message).toEqual(
          expect.stringContaining(`404 page could not be found`)
        )
      }
      expect(baseLoader.pageDb.size).toBe(0)
      expect(emitter.emit).toHaveBeenCalledTimes(0)
    })

    it(`should cache the result of loadPage`, async () => {
      const baseLoader = new BaseLoader(() => Promise.resolve(`instance`), [])
      baseLoader.loadPageDataJson = jest.fn(() =>
        Promise.resolve({
          payload: {},
          status: `success`,
        })
      )

      const expectation = await baseLoader.loadPage(`/mypage/`)
      expect(await baseLoader.loadPage(`/mypage/`)).toBe(expectation)
      expect(baseLoader.loadPageDataJson).toHaveBeenCalledTimes(1)
    })

    it(`should only run 1 network request even when called multiple times`, async () => {
      const baseLoader = new BaseLoader(() => Promise.resolve(`instance`), [])
      baseLoader.loadPageDataJson = jest.fn(() =>
        Promise.resolve({
          payload: {},
          status: `success`,
        })
      )

      const loadPagePromise = baseLoader.loadPage(`/test-page/`)
      expect(baseLoader.inFlightDb.size).toBe(1)
      expect(baseLoader.loadPage(`/test-page/`)).toBe(loadPagePromise)
      expect(baseLoader.inFlightDb.size).toBe(1)

      const expectation = await loadPagePromise

      expect(baseLoader.inFlightDb.size).toBe(0)
      expect(emitter.emit).toHaveBeenCalledTimes(1)
      expect(emitter.emit).toHaveBeenCalledWith(`onPostLoadPageResources`, {
        page: expectation,
        pageResources: expectation,
      })
    })
  })

  describe(`loadPageSync`, () => {
    it(`returns page resources when already fetched`, () => {
      const baseLoader = new BaseLoader(null, [])

      baseLoader.pageDb.set(`/mypage`, { payload: true })
      expect(baseLoader.loadPageSync(`/mypage/`)).toBe(true)
    })

    it(`returns page resources when already fetched`, () => {
      const baseLoader = new BaseLoader(null, [])

      expect(baseLoader.loadPageSync(`/mypage/`)).toBeUndefined()
    })
  })

  describe(`prefetch`, () => {
    const flushPromises = () => new Promise(resolve => setImmediate(resolve))

    it(`shouldn't prefetch when shouldPrefetch is false`, () => {
      const baseLoader = new BaseLoader(null, [])
      baseLoader.shouldPrefetch = jest.fn(() => false)
      baseLoader.doPrefetch = jest.fn()

      expect(baseLoader.prefetch(`/mypath/`)).toBe(false)
      expect(baseLoader.shouldPrefetch).toHaveBeenCalledWith(`/mypath/`)
      expect(baseLoader.doPrefetch).not.toHaveBeenCalled()
    })

    it(`should prefetch when not yet triggered`, async () => {
      jest.useFakeTimers()
      const baseLoader = new BaseLoader(null, [])
      baseLoader.shouldPrefetch = jest.fn(() => true)
      baseLoader.apiRunner = jest.fn()
      baseLoader.doPrefetch = jest.fn(() => Promise.resolve({}))

      expect(baseLoader.prefetch(`/mypath/`)).toBe(true)

      // wait for doPrefetchPromise
      await flushPromises()

      expect(baseLoader.apiRunner).toHaveBeenCalledWith(`onPrefetchPathname`, {
        pathname: `/mypath/`,
      })
      expect(baseLoader.apiRunner).toHaveBeenNthCalledWith(
        2,
        `onPostPrefetchPathname`,
        {
          pathname: `/mypath/`,
        }
      )
    })

    it(`should only run apis once`, async () => {
      const baseLoader = new BaseLoader(null, [])
      baseLoader.shouldPrefetch = jest.fn(() => true)
      baseLoader.apiRunner = jest.fn()
      baseLoader.doPrefetch = jest.fn(() => Promise.resolve({}))

      expect(baseLoader.prefetch(`/mypath/`)).toBe(true)
      expect(baseLoader.prefetch(`/mypath/`)).toBe(true)

      // wait for doPrefetchPromise
      await flushPromises()

      expect(baseLoader.apiRunner).toHaveBeenCalledTimes(2)
      expect(baseLoader.apiRunner).toHaveBeenNthCalledWith(
        1,
        `onPrefetchPathname`,
        expect.anything()
      )
      expect(baseLoader.apiRunner).toHaveBeenNthCalledWith(
        2,
        `onPostPrefetchPathname`,
        expect.anything()
      )
    })
  })
})
