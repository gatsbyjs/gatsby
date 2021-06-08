import { createTestWorker, GatsbyTestWorkerPool } from "./test-helpers"
import {
  store,
  saveState,
  saveStateForWorkers,
  loadStateInWorker,
} from "../../../redux"

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

  it(`test`, () => {
    store.dispatch({
      type: `CREATE_PAGE`,
      payload: dummyPagePayload,
      plugin: {
        name: `test`,
      },
    })

    saveStateForWorkers([`components`])

    const test = loadStateInWorker([`components`])

    console.log(test)
  })
})
