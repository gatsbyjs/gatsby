import { fixedPagePath } from "gatsby-core-utils"
import { store } from "../../redux"
import { getPageData, RETRY_INTERVAL } from "../get-page-data"
import { flush as flushPageData, savePageQueryResult } from "../page-data"
import {
  IGatsbyPage,
  IGatsbyPlugin,
  IQueryStartAction,
  IPageQueryRunAction,
} from "../../redux/types"
import { pageQueryRun, queryStart } from "../../redux/actions/internal"
import { join as pathJoin } from "path"

let MOCK_FILE_INFO = {}
let MOCK_LMDBCACHE_INFO = {}

jest.mock(`fs-extra`, () => {
  return {
    readFile: jest.fn(async (path: string): Promise<any> => {
      if (MOCK_FILE_INFO[path]) {
        return MOCK_FILE_INFO[path]
      }
      throw new Error(`Cannot read file "${path}"`)
    }),
    readJSON: jest.fn(async (path: string): Promise<any> => {
      if (MOCK_FILE_INFO[path]) {
        return JSON.parse(MOCK_FILE_INFO[path])
      }
      throw new Error(`Cannot read file "${path}"`)
    }),
    outputFile: jest.fn(async (path: string, content: string): Promise<any> => {
      MOCK_FILE_INFO[path] = content
    }),
  }
})

jest.mock(`../cache-lmdb`, () => {
  return {
    default: class MockedCache {
      init(): MockedCache {
        return this
      }
      async get<T = unknown>(key): Promise<T | undefined> {
        return MOCK_LMDBCACHE_INFO[key]
      }
      async set<T>(key: string, value: T): Promise<T | undefined> {
        MOCK_LMDBCACHE_INFO[key] = value
        return value
      }
    },
  }
})

jest.mock(`gatsby-cli/lib/reporter`, () => {
  return {
    createProgress: (): any => {
      return {
        start: jest.fn(),
        tick: jest.fn(),
        end: jest.fn(),
      }
    },
    verbose: jest.fn(),
  }
})

describe(`get-page-data-util`, () => {
  const queryResultContent = {
    data: {
      foo: `bar`,
    },
  }

  const pageDataContent = {
    componentChunkName: `foo`,
    path: `/foo`,
    result: queryResultContent,
    staticQueryHashes: [],
  }

  const queryResultStaleContent = {
    data: {
      foo: `I'm stale`,
    },
  }

  const pageDataStaleContent = {
    result: queryResultStaleContent,
  }

  let Pages
  beforeAll(() => {
    Pages = {
      foo: {
        componentChunkName: `foo`,
        path: `/foo`,
        componentPath: `/foo.js`,
        component: `/foo.js`,
        mode: `SSG`, // TODO: need to test other modes in non-build environment
      },
    }

    store.dispatch({
      type: `SET_PROGRAM`,
      payload: {
        directory: __dirname,
      },
    })
  })

  beforeEach(() => {
    store.dispatch({
      type: `DELETE_CACHE`,
    })
    deletePageDataFilesFromFs()
  })

  it(`Resolves immediately if query result is up to date`, async () => {
    // query did already run before
    createPage(Pages.foo)
    startPageQuery(Pages.foo)
    finishQuery(Pages.foo, queryResultContent)
    await flushPageData()

    const resultPromise = getPageData(Pages.foo.path)
    expect(await resultPromise).toEqual(pageDataContent)
  })

  it(`Waits for query to run and resolve properly`, async () => {
    createPage(Pages.foo)
    const resultPromise = getPageData(Pages.foo.path)

    startPageQuery(Pages.foo)
    finishQuery(Pages.foo, queryResultContent)
    await flushPageData()

    expect(await resultPromise).toEqual(pageDataContent)
  })

  describe(`timeouts and retries`, () => {
    it(`it times out eventually (default timeout)`, async () => {
      jest.useFakeTimers({ legacyFakeTimers: true })

      createPage(Pages.foo)
      const resultPromise = getPageData(Pages.foo.path)

      jest.runAllTimers()

      expect(setTimeout).toHaveBeenCalledTimes(3)
      expect(setTimeout).toHaveBeenNthCalledWith(
        1,
        expect.any(Function),
        RETRY_INTERVAL
      )
      expect(setTimeout).toHaveBeenNthCalledWith(
        2,
        expect.any(Function),
        RETRY_INTERVAL
      )
      expect(setTimeout).toHaveBeenNthCalledWith(
        3,
        expect.any(Function),
        RETRY_INTERVAL
      )

      await expect(resultPromise).rejects.toMatchInlineSnapshot(
        `[Error: Couldn't get query results for "/foo" in 15.000s.]`
      )
    })

    it(`it times out eventually (7 second timeout - 5s + 2s)`, async () => {
      jest.useFakeTimers({ legacyFakeTimers: true })

      createPage(Pages.foo)
      const resultPromise = getPageData(Pages.foo.path, 7000)

      jest.runAllTimers()

      expect(setTimeout).toHaveBeenCalledTimes(2)
      expect(setTimeout).toHaveBeenNthCalledWith(
        1,
        expect.any(Function),
        RETRY_INTERVAL
      )
      expect(setTimeout).toHaveBeenNthCalledWith(2, expect.any(Function), 2000)

      await expect(resultPromise).rejects.toMatchInlineSnapshot(
        `[Error: Couldn't get query results for "/foo" in 7.000s.]`
      )
    })

    it(`Can resolve after retry`, async () => {
      jest.useFakeTimers({ legacyFakeTimers: true })

      expect(clearTimeout).toHaveBeenCalledTimes(0)

      createPage(Pages.foo)
      const resultPromise = getPageData(Pages.foo.path)
      startPageQuery(Pages.foo)

      jest.runOnlyPendingTimers()

      // we don't resolve in first timeout and we set timeout for second one
      expect(setTimeout).toHaveBeenCalledTimes(2)
      expect(setTimeout).toHaveBeenNthCalledWith(
        1,
        expect.any(Function),
        RETRY_INTERVAL
      )
      expect(setTimeout).toHaveBeenNthCalledWith(
        1,
        expect.any(Function),
        RETRY_INTERVAL
      )

      finishQuery(Pages.foo, queryResultContent)

      await flushPageData()

      // we cancel second timeout
      expect(clearTimeout).toHaveBeenCalledTimes(1)

      // and result are correct
      expect(await resultPromise).toEqual(pageDataContent)
    })

    it(`Can fallback to stale page-data if it exists (better to potentially unblock user to start doing some work than fail completely)`, async () => {
      jest.useFakeTimers({ legacyFakeTimers: true })

      writePageDataFileToFs(Pages.foo, pageDataStaleContent)

      createPage(Pages.foo)
      const resultPromise = getPageData(Pages.foo.path)

      jest.runAllTimers()

      expect(setTimeout).toHaveBeenCalledTimes(3)
      expect(setTimeout).toHaveBeenNthCalledWith(
        1,
        expect.any(Function),
        RETRY_INTERVAL
      )
      expect(setTimeout).toHaveBeenNthCalledWith(
        2,
        expect.any(Function),
        RETRY_INTERVAL
      )
      expect(setTimeout).toHaveBeenNthCalledWith(
        3,
        expect.any(Function),
        RETRY_INTERVAL
      )

      // we didn't get fresh results, but we resolved to stale ones
      expect(await resultPromise).toEqual(pageDataStaleContent)
    })
  })

  describe(`handles page deletion in the middle of execution gracefully`, () => {
    describe.each([
      // both variants should report that page was deleted
      [
        `Doesn't have stale page-data file for a page`,
        { hasPreviousResults: false },
      ],
      [`Has stale page-data file for a page`, { hasPreviousResults: true }],
    ])(`%s`, (_title, { hasPreviousResults }) => {
      beforeEach(() => {
        if (hasPreviousResults) {
          writePageDataFileToFs(Pages.foo, pageDataStaleContent)
        }
      })

      it(`page is deleted before we start query running`, async () => {
        jest.useFakeTimers()

        createPage(Pages.foo)
        const resultPromise = getPageData(Pages.foo.path)

        deletePage(Pages.foo)

        jest.runAllTimers()

        await expect(resultPromise).rejects.toMatchInlineSnapshot(
          `[Error: Page "/foo" doesn't exist. It might have been deleted recently.]`
        )
      })

      it(`page is deleted after we start query running`, async () => {
        jest.useFakeTimers()

        createPage(Pages.foo)
        const resultPromise = getPageData(Pages.foo.path)
        startPageQuery(Pages.foo)
        deletePage(Pages.foo)
        finishQuery(Pages.foo, queryResultContent)

        jest.runAllTimers()

        await expect(resultPromise).rejects.toMatchInlineSnapshot(
          `[Error: Page "/foo" doesn't exist. It might have been deleted recently.]`
        )
      })

      it(`page is deleted before we flush page data`, async () => {
        jest.useFakeTimers()

        createPage(Pages.foo)
        const resultPromise = getPageData(Pages.foo.path)
        startPageQuery(Pages.foo)
        finishQuery(Pages.foo, queryResultContent)
        deletePage(Pages.foo)

        jest.runAllTimers()

        await expect(resultPromise).rejects.toMatchInlineSnapshot(
          `[Error: Page "/foo" doesn't exist. It might have been deleted recently.]`
        )
      })
    })
  })

  describe(`Query on demand`, () => {
    let programToRestore
    beforeAll(() => {
      process.env.GATSBY_QUERY_ON_DEMAND = `true`
      programToRestore = store.getState().program
      store.dispatch({
        type: `SET_PROGRAM`,
        payload: {
          ...programToRestore,
          _: [`develop`],
        },
      })
    })
    afterAll(() => {
      delete process.env.GATSBY_QUERY_ON_DEMAND
      store.dispatch({
        type: `SET_PROGRAM`,
        payload: programToRestore,
      })
    })

    it(`Will resolve with fresh results if query result was marked dirty while resolving request`, async () => {
      jest.useFakeTimers({ legacyFakeTimers: true })
      createPage(Pages.foo)
      startPageQuery(Pages.foo)
      finishQuery(Pages.foo, queryResultStaleContent)

      const resultPromise = getPageData(Pages.foo.path)

      // mark query as dirty
      createPage(Pages.foo, true)

      // this would cause callback in
      await flushPageData()

      startPageQuery(Pages.foo)
      finishQuery(Pages.foo, queryResultContent)

      await flushPageData()

      expect(await resultPromise).toEqual(pageDataContent)
    })
  })
})

function createPage(
  page: Partial<IGatsbyPage>,
  contextModified: boolean = false
): void {
  store.dispatch({
    type: `CREATE_PAGE`,
    payload: { ...page, context: {} },
    plugin: { name: `get-page-data-test` },
    contextModified,
  })
}

function deletePage(page: Partial<IGatsbyPage>): void {
  store.dispatch({
    type: `DELETE_PAGE`,
    payload: page,
    plugin: { name: `get-page-data-test` },
  })
}

function startPageQuery(page: Partial<IGatsbyPage>): void {
  const payload: IQueryStartAction["payload"] = {
    path: page.path!,
    componentPath: page.componentPath!,
    isPage: true,
  }
  store.dispatch(
    queryStart(payload, { name: `page-data-test` } as IGatsbyPlugin)
  )
}

function finishQuery(
  page: Partial<IGatsbyPage>,
  jsonObject: Record<string, unknown>
): void {
  const payload: IPageQueryRunAction["payload"] = {
    path: page.path!,
    componentPath: page.componentPath!,
    isPage: true,
    resultHash: `resultHash`,
    queryHash: `queryHash`,
  }

  savePageQueryResult(page.path!, JSON.stringify(jsonObject))

  store.dispatch(
    pageQueryRun(payload, { name: `page-data-test` } as IGatsbyPlugin)
  )

  store.dispatch({
    type: `ADD_PENDING_PAGE_DATA_WRITE`,
    payload: {
      path: page.path,
    },
  })
}

function deletePageDataFilesFromFs(): void {
  MOCK_FILE_INFO = {}
  MOCK_LMDBCACHE_INFO = {}
}

function writePageDataFileToFs(
  page: Partial<IGatsbyPage>,
  jsonObject: Record<string, unknown>
): void {
  MOCK_FILE_INFO[
    pathJoin(
      __dirname,
      `public`,
      `page-data`,
      fixedPagePath(page.path!),
      `page-data.json`
    )
  ] = JSON.stringify(jsonObject)
  store.dispatch({
    type: `CLEAR_PENDING_PAGE_DATA_WRITE`,
    payload: { page: page.path },
  })
}
