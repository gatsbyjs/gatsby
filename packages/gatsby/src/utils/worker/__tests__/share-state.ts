import { createTestWorker, GatsbyTestWorkerPool } from "./test-helpers"
import {
  store,
  saveState,
  saveStateForWorkers,
  loadStateInWorker,
} from "../../../redux"
import { GatsbyStateKeys } from "../../../redux/types"

let worker: GatsbyTestWorkerPool | undefined

const dummyPagePayload = {
  path: `/foo/`,
  component: `/foo`,
}

describe(`worker (share-state)`, () => {
  beforeEach(() => {
    store.dispatch({ type: `DELETE_CACHE` })
  })

  afterEach(() => {
    if (worker) {
      worker.end()
      worker = undefined
    }
  })

  it(`doesn't load all of state persisted by main process`, async () => {
    store.dispatch({
      type: `CREATE_PAGE`,
      payload: dummyPagePayload,
      plugin: {
        name: `test`,
      },
    })

    saveState()

    expect(store.getState().pages.get(dummyPagePayload.path))
      .toMatchInlineSnapshot(`
      Object {
        "component": "/foo",
        "componentPath": "/foo",
        "path": "/foo/",
      }
    `)

    worker = createTestWorker()

    const result = await worker.getPage(dummyPagePayload.path)

    expect(result).toBe(null)
  })

  it(`saves and retrieves state for workers correctly`, () => {
    store.dispatch({
      type: `CREATE_PAGE`,
      payload: dummyPagePayload,
      plugin: {
        name: `test`,
      },
    })
    store.dispatch({
      type: `REPLACE_STATIC_QUERY`,
      plugin: {
        name: `test`,
      },
      payload: {
        name: `foo`,
        componentPath: `/foo`,
        id: `1`,
        query: `query`,
        hash: `hash`,
      },
    })

    const slicesOne: Array<GatsbyStateKeys> = [`components`]
    const slicesTwo: Array<GatsbyStateKeys> = [
      `components`,
      `staticQueryComponents`,
    ]

    saveStateForWorkers(slicesOne)
    const resultOne = loadStateInWorker(slicesOne)

    expect(resultOne).toMatchInlineSnapshot(`
      Object {
        "components": Map {
          "/foo" => Object {
            "componentChunkName": undefined,
            "componentPath": "/foo",
            "isInBootstrap": true,
            "pages": Set {
              "/foo/",
            },
            "query": "",
          },
        },
      }
    `)

    saveStateForWorkers(slicesTwo)

    const resultTwo = loadStateInWorker(slicesTwo)

    expect(resultTwo).toMatchInlineSnapshot(`
      Object {
        "components": Map {
          "/foo" => Object {
            "componentChunkName": undefined,
            "componentPath": "/foo",
            "isInBootstrap": true,
            "pages": Set {
              "/foo/",
            },
            "query": "",
          },
        },
        "staticQueryComponents": Map {
          "1" => Object {
            "componentPath": "/foo",
            "hash": "hash",
            "id": "1",
            "name": "foo",
            "query": "query",
          },
        },
      }
    `)
  })

  it(`stores empty state with no slices`, () => {
    store.dispatch({
      type: `CREATE_PAGE`,
      payload: dummyPagePayload,
      plugin: {
        name: `test`,
      },
    })

    const slices: Array<GatsbyStateKeys> = []

    saveStateForWorkers(slices)
    const result = loadStateInWorker(slices)

    expect(result).toEqual({})
  })

  it(`returns default for slice even if no data is given`, () => {
    store.dispatch({
      type: `CREATE_PAGE`,
      payload: dummyPagePayload,
      plugin: {
        name: `test`,
      },
    })

    const slices: Array<GatsbyStateKeys> = [`staticQueryComponents`]

    saveStateForWorkers(slices)
    const result = loadStateInWorker(slices)

    expect(result).toMatchInlineSnapshot(`
      Object {
        "staticQueryComponents": Map {},
      }
    `)
  })

  it(`can set slices results into state and access it`, async () => {
    worker = createTestWorker()

    store.dispatch({
      type: `CREATE_PAGE`,
      payload: dummyPagePayload,
      plugin: {
        name: `test`,
      },
    })

    const slices: Array<GatsbyStateKeys> = [`components`]

    saveStateForWorkers(slices)

    await worker.setState(slices)

    const res = await worker.getComponent(dummyPagePayload.component)

    expect(res).toMatchInlineSnapshot(`
      Object {
        "componentPath": "/foo",
        "isInBootstrap": true,
        "pages": Object {},
        "query": "",
      }
    `)
  })
})
