import { createPages } from "../create-pages"
import { store, emitter } from "../../redux"
import { actions } from "../../redux/actions"
import apiRunnerNode from "../../utils/api-runner-node"
import * as path from "path"

jest.mock(`../../utils/api-runner-node`)

jest.mock(`../../utils/js-chunk-names`, () => {
  return { generateComponentChunkName: (): string => `--mocked--` }
})

jest.mock(`fs-extra`, () => {
  return {
    readFileSync: jest.fn(() => `foo`), // createPage action reads the page template file trying to find `getServerData`
  }
})

let mockAPIs = {}

const component = path.join(process.cwd(), `wat`)

const testPlugin = {
  name: `gatsby-source-test`,
  version: `1.0.0`,
}

describe(`createPages service cleans up not recreated pages`, () => {
  let RealDateNow
  let DateNowCallCount = 0

  let createPagesRun = 1
  let createPagesStatefullyRun = 1

  let createPagesHook
  let createPagesStatefullyHook

  let deletePageActions

  function onDeletePage(deletePageAction): void {
    deletePageActions.push(deletePageAction)
  }

  beforeAll(() => {
    RealDateNow = Date.now
    Date.now = jest.fn(() => ++DateNowCallCount)
    apiRunnerNode.mockImplementation((apiName, opts = {}) => {
      if (mockAPIs[apiName]) {
        return mockAPIs[apiName](
          {
            actions: Object.keys(actions).reduce((acc, actionName) => {
              acc[actionName] = (...args): any =>
                store.dispatch(actions[actionName](...args, testPlugin, opts))
              return acc
            }, {}),
          },
          {}
        )
      }
      return undefined
    })

    createPagesHook = mockAPIs[`createPages`] = jest.fn(
      ({ actions }, _pluginOptions) => {
        actions.createPage({
          path: `/stateless/stable`,
          component,
        })
        actions.createPage({
          path: `/stateless/dynamic/${createPagesRun}`,
          component,
        })
        createPagesRun++
      }
    )

    createPagesStatefullyHook = mockAPIs[`createPagesStatefully`] = jest.fn(
      ({ actions }, _pluginOptions) => {
        actions.createPage({
          path: `/stateful/stable`,
          component,
        })
        actions.createPage({
          path: `/stateful/dynamic/${createPagesStatefullyRun}`,
          component,
        })
        createPagesStatefullyRun++
      }
    )

    emitter.on(`DELETE_PAGE`, onDeletePage)
  })

  beforeEach(() => {
    createPagesRun = 1
    createPagesStatefullyRun = 1
    createPagesHook.mockClear()
    createPagesStatefullyHook.mockClear()
    deletePageActions = []

    store.dispatch({ type: `DELETE_CACHE` })
  })

  afterAll(() => {
    Date.now = RealDateNow
    mockAPIs = {}
    emitter.off(`DELETE_PAGE`, onDeletePage)
  })

  it.each([
    [`From cold cache`, { cacheStatus: `COLD` }],
    [`From warm cache`, { cacheStatus: `WARM` }],
  ])(`%s`, async (_, { cacheStatus }) => {
    expect(deletePageActions).toEqual([])
    expect(store.getState().pages.size).toEqual(0)

    if (cacheStatus === `WARM`) {
      // add some junk
      store.dispatch(
        actions.createPage(
          {
            path: `/stateless/junk`,
            component,
            context: {},
          },
          testPlugin
        )
      )
      store.dispatch(
        actions.createPage(
          {
            path: `/stateful/junk`,
            component,
            context: {},
          },
          testPlugin,
          {
            traceId: `initial-createPagesStatefully`,
          }
        )
      )

      expect(store.getState().pages.size).toEqual(2)
      expect(Array.from(store.getState().pages.keys())).toEqual([
        `/stateless/junk/`,
        `/stateful/junk/`,
      ])
      expect(
        store.getState().pages.get(`/stateless/junk/`)
          .isCreatedByStatefulCreatePages
      ).toEqual(false)
      expect(
        store.getState().pages.get(`/stateful/junk/`)
          .isCreatedByStatefulCreatePages
      ).toEqual(true)
    } else {
      expect(store.getState().pages.size).toEqual(0)
    }

    expect(mockAPIs[`createPages`]).toHaveBeenCalledTimes(0)
    expect(mockAPIs[`createPagesStatefully`]).toHaveBeenCalledTimes(0)

    await createPages({ store, shouldRunCreatePagesStatefully: true })

    expect(mockAPIs[`createPages`]).toHaveBeenCalledTimes(1)
    expect(mockAPIs[`createPagesStatefully`]).toHaveBeenCalledTimes(1)
    expect(store.getState().pages.size).toEqual(4)
    expect(Array.from(store.getState().pages.keys())).toEqual(
      expect.arrayContaining([
        `/stateless/stable/`,
        `/stateless/dynamic/1/`,
        `/stateful/stable/`,
        `/stateful/dynamic/1/`,
      ])
    )

    if (cacheStatus === `WARM`) {
      // "junk" pages were not recreated, so we expect DELETE_PAGE action to be emitted for those
      expect(deletePageActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: `DELETE_PAGE`,
            payload: expect.objectContaining({
              path: `/stateless/junk/`,
            }),
          }),
        ])
      )
      expect(deletePageActions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: `DELETE_PAGE`,
            payload: expect.objectContaining({
              path: `/stateful/junk/`,
            }),
          }),
        ])
      )
    }

    await createPages({ store, shouldRunCreatePagesStatefully: false })

    // createPagesStatefully should not be called and stateful pages should remain as they were before calling `createPages` service
    expect(mockAPIs[`createPages`]).toHaveBeenCalledTimes(2)
    expect(mockAPIs[`createPagesStatefully`]).toHaveBeenCalledTimes(1)
    expect(store.getState().pages.size).toEqual(4)

    expect(Array.from(store.getState().pages.keys())).toEqual(
      expect.arrayContaining([
        `/stateless/stable/`,
        `/stateless/dynamic/2/`,
        `/stateful/stable/`,
        `/stateful/dynamic/1/`,
      ])
    )

    // 1st dynamic page was not recreated so we expect that we emitted DELETE_PAGE action
    expect(deletePageActions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: `DELETE_PAGE`,
          payload: expect.objectContaining({
            path: `/stateless/dynamic/1/`,
          }),
        }),
      ])
    )
  })
})
