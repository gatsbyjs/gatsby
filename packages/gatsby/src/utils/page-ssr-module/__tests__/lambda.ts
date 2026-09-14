import express from "express"
import type { AddressInfo } from "net"
import type { GatsbyFunctionRequest, GatsbyFunctionResponse } from "gatsby"
import type { EnginePage } from "../entry"
import type { IEngineAdapterOptions } from "../../adapter/types"

// `lambda.ts` is a bundle template: it `require`s files that only exist once it has
// been built into `.cache/page-ssr-module/`, so they are stubbed virtually here.
// Note the path is relative to *this* file, not to lambda.ts.
const mockFindEnginePageByPath = jest.fn()
const mockGetData = jest.fn()
const mockRenderHTML = jest.fn()
const mockRenderPageData = jest.fn()

jest.mock(
  `../../query-engine`,
  () => {
    return { GraphQLEngine: class {} }
  },
  {
    virtual: true,
  }
)

// Importing the module eagerly warms the GraphQL engine, which tries to download
// the datastore because the unsubstituted `%CDN_DATASTORE_PATH%` is truthy. The
// request itself fails harmlessly on the placeholder URL, but `ensureDir` would
// create directories inside the source tree.
jest.mock(`fs-extra`, () => {
  return {
    ...jest.requireActual(`fs-extra`),
    ensureDir: jest.fn().mockResolvedValue(undefined),
  }
})

jest.mock(
  `../index`,
  () => {
    return {
      findEnginePageByPath: mockFindEnginePageByPath,
      getData: mockGetData,
      renderHTML: mockRenderHTML,
      renderPageData: mockRenderPageData,
    }
  },
  { virtual: true }
)

type EngineHandler = (
  req: GatsbyFunctionRequest,
  res: GatsbyFunctionResponse,
  adapter?: IEngineAdapterOptions
) => Promise<void>

let engineHandler: EngineHandler
let chdirSpy: jest.SpyInstance
let logSpy: jest.SpyInstance

beforeAll(() => {
  // webpack replaces this at bundle time; under jest it has to be supplied.
  // `.resolve` delegates to jest's resolver so moduleNameMapper still handles
  // the unsubstituted `%...%` placeholders it is called with.
  ;(
    global as unknown as { __non_webpack_require__: unknown }
  ).__non_webpack_require__ = Object.assign((id: string) => require(id), {
    resolve: (id: string): string => require.resolve(id),
  })
  // module scope chdirs relative to the built lambda's location
  chdirSpy = jest.spyOn(process, `chdir`).mockImplementation(() => {})
  // and logs the datastore download it attempts on import
  logSpy = jest.spyOn(console, `log`).mockImplementation(() => {})
  engineHandler = require(`../lambda`).default
})

afterAll(() => {
  chdirSpy.mockRestore()
  logSpy.mockRestore()
  delete (global as unknown as { __non_webpack_require__?: unknown })
    .__non_webpack_require__
})

const page = (mode: EnginePage["mode"]): EnginePage =>
  ({ mode, path: `/some-page/` } as EnginePage)

/**
 * Serves `engineHandler` from a real express app and makes a real request, so the
 * response semantics under test (default 200, header write window) are express's
 * rather than a hand-rolled double's.
 *
 * `adapterFor` receives the live response so a test can do what an adapter really
 * does - set headers from inside `onPageResponse`.
 */
async function requestPage(
  path: string,
  adapterFor?: (res: GatsbyFunctionResponse) => IEngineAdapterOptions
): Promise<{ status: number; body: string; headers: Headers }> {
  const app = express()
  app.use((req, res) => {
    void engineHandler(
      req as unknown as GatsbyFunctionRequest,
      res as unknown as GatsbyFunctionResponse,
      adapterFor?.(res as unknown as GatsbyFunctionResponse)
    )
  })

  const server = app.listen(0)
  try {
    await new Promise(resolve => server.once(`listening`, resolve))
    const { port } = server.address() as AddressInfo
    const response = await fetch(`http://127.0.0.1:${port}${path}`)

    return {
      status: response.status,
      body: await response.text(),
      headers: response.headers,
    }
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
}

const CACHE_HEADER = `x-should-cache`

/**
 * Mirrors what a real adapter does with the callback: record it, and turn it into
 * a response header. Asserting on the header proves the details reached the client,
 * not merely that the callback ran.
 */
function recordingAdapter(): {
  onPageResponse: jest.Mock
  adapterFor: (res: GatsbyFunctionResponse) => IEngineAdapterOptions
} {
  const onPageResponse = jest.fn()

  return {
    onPageResponse,
    adapterFor: (res): IEngineAdapterOptions => {
      return {
        onPageResponse: (details): void => {
          onPageResponse(details)
          res.setHeader(CACHE_HEADER, String(details.cache))
        },
      }
    },
  }
}

beforeEach(() => {
  jest.clearAllMocks()
  mockGetData.mockResolvedValue({})
  mockRenderHTML.mockResolvedValue(`<html></html>`)
  mockRenderPageData.mockResolvedValue({ result: {} })
})

describe(`engineHandler adapter.onPageResponse`, () => {
  it(`reports cache:true for a DSG page`, async () => {
    mockFindEnginePageByPath.mockReturnValue(page(`DSG`))
    const { onPageResponse, adapterFor } = recordingAdapter()

    const res = await requestPage(`/some-page/`, adapterFor)

    expect(onPageResponse).toHaveBeenCalledTimes(1)
    expect(onPageResponse).toHaveBeenCalledWith({ cache: true })
    expect(res.headers.get(CACHE_HEADER)).toBe(`true`)
    expect(res.status).toBe(200)
    expect(res.body).toBe(`<html></html>`)
  })

  it(`reports cache:false for an SSR page`, async () => {
    mockFindEnginePageByPath.mockReturnValue(page(`SSR`))
    const { onPageResponse, adapterFor } = recordingAdapter()

    const res = await requestPage(`/some-page/`, adapterFor)

    expect(onPageResponse).toHaveBeenCalledTimes(1)
    expect(onPageResponse).toHaveBeenCalledWith({ cache: false })
    expect(res.headers.get(CACHE_HEADER)).toBe(`false`)
    expect(res.status).toBe(200)
    expect(res.body).toBe(`<html></html>`)
  })

  it(`reports on page-data requests too, not just HTML`, async () => {
    mockFindEnginePageByPath.mockReturnValue(page(`DSG`))
    const { onPageResponse, adapterFor } = recordingAdapter()

    const res = await requestPage(
      `/page-data/some-page/page-data.json`,
      adapterFor
    )

    expect(mockRenderPageData).toHaveBeenCalled()
    expect(onPageResponse).toHaveBeenCalledWith({ cache: true })
    expect(res.headers.get(CACHE_HEADER)).toBe(`true`)
    expect(res.status).toBe(200)
    expect(JSON.parse(res.body)).toEqual({ result: {} })
  })

  it(`is not called when the request doesn't resolve to a page`, async () => {
    mockFindEnginePageByPath.mockReturnValue(undefined)
    const { onPageResponse, adapterFor } = recordingAdapter()

    const res = await requestPage(`/nope/`, adapterFor)

    expect(res.status).toBe(404)
    expect(onPageResponse).not.toHaveBeenCalled()
    expect(res.headers.get(CACHE_HEADER)).toBeNull()
  })

  it(`is not called when rendering throws`, async () => {
    mockFindEnginePageByPath.mockReturnValue(page(`DSG`))
    mockRenderHTML.mockRejectedValue(new Error(`boom`))
    const errorSpy = jest.spyOn(console, `error`).mockImplementation(() => {})
    const { onPageResponse, adapterFor } = recordingAdapter()

    const res = await requestPage(`/some-page/`, adapterFor)

    expect(res.status).toBe(500)
    expect(onPageResponse).not.toHaveBeenCalled()
    expect(res.headers.get(CACHE_HEADER)).toBeNull()
    errorSpy.mockRestore()
  })

  it(`is optional - the page still renders without an adapter`, async () => {
    mockFindEnginePageByPath.mockReturnValue(page(`DSG`))

    const res = await requestPage(`/some-page/`)

    expect(res.status).toBe(200)
    expect(res.body).toBe(`<html></html>`)
  })
})
