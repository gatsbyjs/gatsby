import { createTestWorker, GatsbyTestWorkerPool } from "./test-helpers"
import {
  store,
  saveState,
  savePartialStateToDisk,
  loadPartialStateFromDisk,
} from "../../../redux"
import { GatsbyStateKeys } from "../../../redux/types"

let worker: GatsbyTestWorkerPool | undefined

const dummyPagePayload = {
  path: `/foo/`,
  component: `/foo`,
  componentPath: `/foo`,
}

describe(`worker (share-state)`, () => {
  beforeEach(() => {
    store.dispatch({ type: `DELETE_CACHE` })
  })

  afterEach(async () => {
    if (worker) {
      await Promise.all(worker.end())
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

    const result = await worker.single.getPage(dummyPagePayload.path)

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

    savePartialStateToDisk(slicesOne)
    const resultOne = loadPartialStateFromDisk(slicesOne)

    expect(resultOne).toMatchInlineSnapshot(`
      Object {
        "components": Map {
          "/foo" => Object {
            "Head": false,
            "componentChunkName": undefined,
            "componentPath": "/foo",
            "config": false,
            "isInBootstrap": true,
            "isSlice": false,
            "pages": Set {
              "/foo/",
            },
            "query": "",
            "serverData": false,
          },
        },
      }
    `)

    savePartialStateToDisk(slicesTwo)

    const resultTwo = loadPartialStateFromDisk(slicesTwo)

    expect(resultTwo).toMatchInlineSnapshot(`
      Object {
        "components": Map {
          "/foo" => Object {
            "Head": false,
            "componentChunkName": undefined,
            "componentPath": "/foo",
            "config": false,
            "isInBootstrap": true,
            "isSlice": false,
            "pages": Set {
              "/foo/",
            },
            "query": "",
            "serverData": false,
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

    savePartialStateToDisk(slices)
    const result = loadPartialStateFromDisk(slices)

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

    savePartialStateToDisk(slices)
    const result = loadPartialStateFromDisk(slices)

    expect(result).toMatchInlineSnapshot(`
      Object {
        "staticQueryComponents": Map {},
      }
    `)
  })

  it(`can set slices results into state and access page & static queries`, async () => {
    worker = createTestWorker()
    const staticQueryID = `1`

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
        componentPath: dummyPagePayload.component,
        id: staticQueryID,
        query: `I'm a static query`,
        hash: `hash`,
      },
    })

    store.dispatch({
      type: `QUERY_EXTRACTED`,
      payload: {
        componentPath: `/foo`,
        componentChunkName: `foo`,
        query: `I'm a page query`,
      },
      plugin: {
        name: `test`,
      },
    })

    savePartialStateToDisk([`components`, `staticQueryComponents`])

    await Promise.all(worker.all.setComponents())

    const components = await worker.single.getComponent(
      dummyPagePayload.component
    )
    const staticQueryComponents = await worker.single.getStaticQueryComponent(
      staticQueryID
    )

    expect(components).toMatchInlineSnapshot(`
      Object {
        "Head": false,
        "componentPath": "/foo",
        "config": false,
        "isInBootstrap": true,
        "isSlice": false,
        "pages": Object {},
        "query": "I'm a page query",
        "serverData": false,
      }
    `)

    expect(staticQueryComponents).toMatchInlineSnapshot(`
      Object {
        "componentPath": "/foo",
        "hash": "hash",
        "id": "1",
        "name": "foo",
        "query": "I'm a static query",
      }
    `)
  })

  it(`can set slices results into state and access inference metadata`, async () => {
    worker = createTestWorker()

    store.dispatch({
      type: `BUILD_TYPE_METADATA`,
      payload: {
        typeName: `Test`,
        nodes: [
          {
            id: `1`,
            parent: null,
            children: [],
            foo: `bar`,
            internal: { type: `Test` },
          },
        ],
      },
    })

    savePartialStateToDisk([`inferenceMetadata`])

    await Promise.all(worker.all.setInferenceMetadata())

    const inf = await worker.single.getInferenceMetadata(`Test`)

    expect(inf).toMatchInlineSnapshot(`
      Object {
        "dirty": true,
        "fieldMap": Object {
          "foo": Object {
            "string": Object {
              "example": "bar",
              "first": "1",
              "total": 1,
            },
          },
        },
        "ignoredFields": Object {},
        "total": 1,
      }
    `)
  })
})
