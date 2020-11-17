import { store } from "../../redux"
import { getPageData } from "../get-page-data"
import {
  IGatsbyPage,
  IGatsbyPlugin,
  IQueryStartAction,
} from "../../redux/types"
import { pageQueryRun, queryStart } from "../../redux/actions/internal"

const MOCK_FILE_INFO = {}

jest.mock(`fs-extra`, () => {
  return {
    readJson: jest.fn(path => {
      if (MOCK_FILE_INFO[path]) {
        return MOCK_FILE_INFO[path]
      }
      throw new Error(`Doesn't exist`)
    }),
    pathExists: jest.fn(path => !!MOCK_FILE_INFO[path]),
    readFile: jest.fn(path => JSON.stringify(MOCK_FILE_INFO[path])),
  }
})

describe(`get-page-data-util`, () => {
  let Pages
  beforeAll(() => {
    Pages = {
      foo: {
        path: `/foo`,
        componentPath: `/foo.js`,
        component: `/foo.js`,
      },
      bar: {
        path: `/bar`,
        componentPath: `/bar.js`,
        component: `/bar.js`,
      },
      bar2: {
        path: `/bar2`,
        componentPath: `/bar.js`,
        component: `/bar.js`,
      },
    }

    store.dispatch({
      type: `SET_PROGRAM`,
      payload: {
        directory: __dirname,
      },
    })
  })

  it(`times out gracefully`, async () => {
    jest.useFakeTimers()

    createPage(Pages.foo)
    const resultPromise = getPageData(Pages.foo.path)

    expect(setTimeout).toHaveBeenCalledTimes(1)
    expect(setTimeout).toHaveBeenLastCalledWith(expect.any(Function), 10000)

    jest.runAllTimers()

    expect(resultPromise).rejects.toThrowError(
      `Error loading a result for the page query in "/foo". Query was not run and no cached result was found.`
    )
  })

  it.skip(`handles page deletion in the middle of execution gracefully`, async () => {
    // TODO
    createPage(Pages.foo)
    const resultPromise = getPageData(Pages.foo.path)
    startPageQuery(Pages.foo)
    deletePage(Pages.foo)

    const result = await resultPromise
    expect(result).toEqual({})
  })
})

function createPage(page: Partial<IGatsbyPage>): void {
  store.dispatch({
    type: `CREATE_PAGE`,
    payload: { ...page, context: {} },
    plugin: { name: `get-page-data-test` },
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
    path: page.path,
    componentPath: page.componentPath,
    isPage: true,
  }
  store.dispatch(
    queryStart(payload, { name: `page-data-test` } as IGatsbyPlugin)
  )
}

function finishQuery(page: Partial<IGatsbyPage>): void {
  const payload: IQueryStartAction["payload"] = {
    path: page.path,
    componentPath: page.componentPath,
    isPage: true,
  }
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

function clearDataWrite(page: Partial<IGatsbyPage>): void {
  store.dispatch({
    type: `CLEAR_PENDING_PAGE_DATA_WRITE`,
    payload: { page: page.path },
  })
}
