/**
 * @jest-environment jsdom
 */

import mock from "xhr-mock"
import { ProdLoader } from "../loader"

jest.mock("../emitter")

describe(`Reproduction of Issue #32142`, () => {
  let originalBasePath
  let originalPathPrefix

  beforeEach(() => {
    originalBasePath = global.__BASE_PATH__
    originalPathPrefix = global.__PATH_PREFIX__
    global.__BASE_PATH__ = `/blog`
    global.__PATH_PREFIX__ = `/blog`
    
    // Mock window.location
    delete window.location
    window.location = {
      href: `http://localhost:8000/blog/missing`,
      pathname: `/blog/missing`,
    }
  })

  afterEach(() => {
    global.__BASE_PATH__ = originalBasePath
    global.__PATH_PREFIX__ = originalPathPrefix
    mock.teardown()
  })

  const mockPageData = (path, status, responseText = ``, json = false) => {
    // Note: createPageDataUrl adds pathPrefix
    // If path is /missing, url is /blog/page-data/missing/page-data.json
    const url = `/blog/page-data${path}/page-data.json`
    mock.get(url, (req, res) => {
      if (json) {
        res.header(`content-type`, `application/json`)
      }
      return res.status(status).body(
        typeof responseText === `string`
          ? responseText
          : JSON.stringify(responseText)
      )
    })
  }

  it(`should load 404 page when pathPrefix is used and page is missing`, async () => {
    mock.setup()
    const prodLoader = new ProdLoader(null, [])

    // 1. Request for /missing (relative to prefix) -> /blog/page-data/missing/page-data.json -> 404
    mockPageData(`/missing`, 404)

    // 2. Fallback to /404.html -> /blog/page-data/404.html/page-data.json -> 200
    const payload404 = {
      path: `/404.html`,
      componentChunkName: `component---src-pages-404-js`,
      result: { pageContext: {} },
    }
    mockPageData(`/404.html`, 200, payload404, true)

    // We expect loadPage to succeed and return the 404 page data
    // The input to loadPage is the full path including prefix
    const result = await prodLoader.loadPage(`/blog/missing`)

    expect(result).toEqual(expect.objectContaining({
      status: `success`,
      page: payload404,
    }))
    expect(result.notFound).toBe(true)
  })
})
