// This is by no means a full test file for loader.js so feel free to add more tests.
import mock from "xhr-mock"
import { BaseLoader } from "../loader"

describe(`BaseLoader`, () => {
  describe(`loadPageDataJson`, () => {
    let originalBasePath
    let originalPathPrefix
    let xhrCount

    /**
     * @param {string} path
     * @param {number} status
     * @param {boolean} json
     */
    const mockPageData = (path, status, json) => {
      mock.get(`/page-data${path}/page-data.json`, (req, res) => {
        xhrCount++
        if (json) {
          res.header(`content-type`, `application/json`)
        }
        return res.status(status).body(json ? `{ "path": "${path}/" }` : ``)
      })
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
      expect.assertions(3)
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/mypage`, 200, true)

      const expectation = {
        status: `success`,
        pagePath: `/mypage`,
        payload: { path: `/mypage/` },
      }
      expect(await baseLoader.loadPageDataJson(`/mypage/`)).toEqual(expectation)
      expect(baseLoader.pageDataDb.get(`/mypage`)).toEqual(expectation)
      expect(xhrCount).toBe(1)
    })

    it(`should load a 404 page when page-path file is not a json`, async () => {
      expect.assertions(3)
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/unknown-page`, 200, false)
      mockPageData(`/404.html`, 200, true)

      const expectation = {
        status: `success`,
        pagePath: `/404.html`,
        notFound: true,
        payload: {
          path: `/404.html/`,
        },
      }
      expect(await baseLoader.loadPageDataJson(`/unknown-page/`)).toEqual(
        expectation
      )
      expect(baseLoader.pageDataDb.get(`/unknown-page`)).toEqual(expectation)
      expect(xhrCount).toBe(2)
    })

    it(`should load a 404 page when path returns a 404`, async () => {
      expect.assertions(3)
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/unknown-page`, 200, false)
      mockPageData(`/404.html`, 200, true)

      const expectation = {
        status: `success`,
        pagePath: `/404.html`,
        notFound: true,
        payload: {
          path: `/404.html/`,
        },
      }
      expect(await baseLoader.loadPageDataJson(`/unknown-page/`)).toEqual(
        expectation
      )
      expect(baseLoader.pageDataDb.get(`/unknown-page`)).toEqual(expectation)
      expect(xhrCount).toBe(2)
    })

    it(`should return a failure when status is 404 and 404 page is fetched`, async () => {
      expect.assertions(3)
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/unknown-page`, 404, false)
      mockPageData(`/404.html`, 404, false)

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
      expect.assertions(3)
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/error-page`, 500, false)

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
      expect.assertions(3)
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/blocked-page`, 0, false)

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
      expect.assertions(3)
      const baseLoader = new BaseLoader(null, [])

      let xhrCount = 0
      mock.get(`/page-data/blocked-page/page-data.json`, (req, res) => {
        if (xhrCount++ === 0) {
          return res.status(0).body(``)
        } else {
          res.header(`content-type`, `application/json`)
          return res.status(200).body(`{ "path": "/blocked-page/" }`)
        }
      })

      const expectation = {
        status: `success`,
        retries: 1,
        pagePath: `/blocked-page`,
        payload: {
          path: `/blocked-page/`,
        },
      }
      expect(await baseLoader.loadPageDataJson(`/blocked-page/`)).toEqual(
        expectation
      )
      expect(baseLoader.pageDataDb.get(`/blocked-page`)).toEqual(expectation)
      expect(xhrCount).toBe(2)
    })

    it(`shouldn't load pageData multiple times`, async () => {
      expect.assertions(2)
      const baseLoader = new BaseLoader(null, [])

      mockPageData(`/mypage`, 200, true)

      const expectation = await baseLoader.loadPageDataJson(`/mypage/`)
      expect(await baseLoader.loadPageDataJson(`/mypage/`)).toBe(expectation)
      expect(xhrCount).toBe(1)
    })
  })
})
